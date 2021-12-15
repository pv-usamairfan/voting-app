import React, { Component } from "react";
import './Joke.css'

class Joke extends Component {

    getColor() {
        const { votes } = this.props;
        if (votes >= 15) return "#4CAF50"
        if (votes >= 12) return "#8BC34A"
        if (votes >= 9) return "#CDDC39"
        if (votes >= 6) return "#FFEB3B"
        if (votes >= 3) return "#FFC107"
        return "#F44336"
    }

    getEmoji() {
        const { votes } = this.props;
        if (votes >= 15) return "em em-rolling_on_the_floor_laughing";
        if (votes >= 12) return "em em-laughing";
        if (votes >= 9) return "em em-smiley";
        if (votes >= 6) return "em em-slightly_smiling_face"; 
        if (votes >= 3) return "em em-neutral_face";
        if (votes >= 0) return "em em-confused";
        return "em em-angry";
    }

    render() {
        return (
            <div className="Joke">
                <div className="Joke-buttons">
                    <i className="fas fa-arrow-up" onClick={this.props.upvote}></i>
                    <span
                        className="Joke-votes"
                        style={{ borderColor: this.getColor() }}
                    >
                        {this.props.votes}
                    </span>
                    <i className="fas fa-arrow-down" onClick={this.props.downvote}></i>
                </div>
                <div className="Joke-text">
                    {this.props.text}
                </div>
                <div className="Joke-smiley">
                    <i className={this.getEmoji()}></i>
                </div>
            </div>
        )
    }
}

export default Joke