import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from './CreateRoomPage';
import MusicPlayer from './MusicPlayer';

function Room(props) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
      showSettings: false,
      spotifyAuthenticated: false,
      song: {}
  });

  const getRoomDetails = () => {
    console.log(props, 'inside Room');
    fetch(`/api/get-room?code=${roomCode}`)
      .then((res) => {
        if (!res.ok) {
          props.leaveRoomCallback();
          navigate('/');
        }
        return res.json();
      })
      .then((data) => {
        setState((prevState) => {
          const newState = {
            ...prevState,
            votesToSkip: data.votes_to_skip,
            guestCanPause: data.guest_can_pause,
            isHost: data.is_host,
          };
          
          // Call authenticateSpotify after updating the state
          if (newState.isHost) {
            authenticateSpotify();
          }
  
          return newState;
        });
      })
      .catch((error) => {
        console.error('Error fetching room details:', error);
      });
  };
  

  const authenticateSpotify = () => {
    console.log('function hit');
    fetch('/spotify/is-authenticated')
      .then((res) => res.json())
      .then((data) => {
        console.log('data fetched');
        setState((prevState) => ({
          ...prevState,
          spotifyAuthenticated: data.status
        }));
        if (!data.status) {
          fetch('/spotify/get-auth-url')
            .then((res) => res.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  };

  const getCurrentSong = () => {
    fetch('/spotify/current-song').then((res) => {
      if (!res.ok) {
        return {}
      } else {
        return res.json();
      }
    }).then((data) => setState((prevState) => ({ ...prevState, song: data })));
  }
  

  const leaveButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
    }
    fetch('/api/leave-room', requestOptions).then((res) => {
      if (props.leaveRoomCallback) {
        props.leaveRoomCallback();
      }
      navigate('/');
    })
  }

  const updateShowSettings = (value) => {
    setState((prevState) => ({
      ...prevState,
      showSettings: value
    }));
  } 

  const renderSettings = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage 
          update={true} 
          votesToSkip={state.votesToSkip} 
          guestCanPause={state.guestCanPause} 
          roomCode={roomCode} 
          updateCallback={getRoomDetails}
        />
        </Grid>
        <Grid item xs={12} align="center">
        <Button variant="contained" color="secondary" onClick={() => updateShowSettings(false)}>
          Close
        </Button>
        </Grid>
      </Grid>
    )
  }

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button variant="contained" color="primary" onClick={() => updateShowSettings(true)}>
          Settings
        </Button>
      </Grid>
    );
  }

  useEffect(() => {
    getRoomDetails();
  }, [roomCode]);

  useEffect(() => {
    const interval = setInterval(getCurrentSong, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    state.showSettings ? renderSettings() 
    :
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant='h5' component='h5'>
          Room Code: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
      <MusicPlayer {...state.song} />
      </Grid>
      {state.isHost ? renderSettingsButton() : null}
      <Grid item xs={12} align="center">
        <Button variant="contained" color="secondary" onClick={leaveButtonPressed}>
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
}

export default Room;