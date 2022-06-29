import React, { Component } from "react";
import './Joke.css'
import secondPrize from "./asset/dollorImages/heavy-dollar-sign_1f4b2 (2) (1).webp";
import firstPrize from "./asset/dollorImages/heavy-dollar-sign_1f4b2 (4).png";
import thirdPrize from "./asset/dollorImages/heavy-dollar-sign_1f4b2 (3).webp"
import lastPrize from "./asset/dollorImages/heavy-dollar-sign_1f4b2.webp";



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
         if (votes >= 15) return firstPrize;
         if (votes >= 12) return secondPrize;
         if (votes >= 9) return thirdPrize;
         if (votes >= 6) return thirdPrize ;
        if (votes >= 0) return lastPrize;
        if (votes >= -2) return lastPrize;
        return lastPrize;
    }
   uploadImage(){
    console.log("hello");
   }
    render() {
        return (
            <div className="Joke">
                <div className="Joke-buttons">
                   { this.props.login && <i className="fas fa-arrow-up" onClick={this.props.upvote}></i>}
                    {this.props.admin?   <span
                        className="Joke-votes"
                        style={{ borderColor: this.getColor() , backgroundImage:`url(${this.props.content})` }}

                    >
                        {this.props.votes}
                       <i className="fa fa-upload upload-image" onClick={this.uploadImage}></i>
                    </span> 
                    :  <span
                        className="Joke-votes"
                        style={{ borderColor: this.getColor() , backgroundImage:`url(${this.props.content})`}}
                    >
                        {this.props.votes}
                    </span>}
                  
                    {this.props.login && <i className="fas fa-arrow-down" onClick={this.props.downvote}></i> }
                   
                </div>
                <div className="Joke-text">
                    <div className="joke-img">
                    <img className="img" src={this.props.content}/>
                    </div>
                </div>
                <div className="Joke-smiley">
                      <img  src={this.getEmoji()} alt="Logo" />
                </div>
            </div>
        )
    }
}

export default Joke
