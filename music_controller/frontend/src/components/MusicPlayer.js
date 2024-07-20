import React, { Component } from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNext from "@material-ui/icons/SkipNext";
import Info from "./info";

export default class MusicPlayer extends Component {
  constructor(props) {
    super(props);

    this.pauseSong = this.pauseSong.bind(this);
    this.playSong = this.playSong.bind(this);
    this.skipSong = this.skipSong.bind(this);
  }

  skipSong() {
    const requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' }
    };
    fetch('/spotify/skip', requestOptions);
  }

  pauseSong() {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/pause", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Pause request succeeded with JSON response", data);
      })
      .catch((error) => {
        console.error("There was a problem with the pause request:", error);
      });
  }

  playSong() {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/play", requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Play request succeeded with JSON response", data);
      })
      .catch((error) => {
        console.error("There was a problem with the play request:", error);
      });
  }

  render() {
    const songProgress = (this.props.time / this.props.duration) * 100;

    return (
      <Card>
        <Grid container alignItems="center">
          <Grid item align="center" xs={4}>
            <img src={this.props.image_url} height="100%" width="100%" />
          </Grid>
          <Grid item align="center" xs={8}>
            <Typography component="h5" variant="h5">
              {this.props.title}
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              {this.props.artist}
            </Typography>
            <div>
              <IconButton>
                {this.props.is_playing ? (
                  <PauseIcon onClick={this.pauseSong} />
                ) : (
                  <PlayArrowIcon onClick={this.playSong} />
                )}
              </IconButton>
              <IconButton onClick={this.skipSong}>
                <SkipNext /> {this.props.votes} /{" "}{this.props.votes_required}
              </IconButton>
            </div>
          </Grid>
        </Grid>
        <LinearProgress variant="determinate" value={songProgress}></LinearProgress>
      </Card>
    );
  }
}
