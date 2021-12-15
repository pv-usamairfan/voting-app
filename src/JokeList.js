import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke"
import "./JokeList.css";

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    }

    constructor(props) {
        super(props)
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"), //must use "[]", value in JSON.parse must be string
            loading: false
        }
        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount() {
        if (this.state.jokes.length === 0) this.getJokes()
    }

    async getJokes() {
        try {
            let jokes = []
            //use new Set to prevent jokes duplication from API
            const seenJokes = new Set(this.state.jokes.map(j => j.id))

            while (jokes.length < this.props.numJokesToGet) {
                let res = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } })

                if (!seenJokes.has(res.data.id)) {
                    jokes.push({
                        text: res.data.joke,
                        id: res.data.id,
                        votes: 0
                    })
                    // below is usefully to prevent duplication
                    // when there's no jokes in this.state when doing the first call. 
                    seenJokes.add(res.data.id)
                } else {
                    console.log("Duplicate Jokes Found!!!")
                }
            }
            console.log(jokes)
            console.log(seenJokes)
            this.setState(st => ({
                loading: false,
                jokes: [...st.jokes, ...jokes]
            }),
                () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
                //above callback function run right after setState finished
            )
        } catch (e) {
            alert(e)
            this.setState({ loading: false })
        }
    }


    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j => (
                j.id === id ? { ...j, votes: j.votes + delta } : j
            ))
        }),
            () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        )
    }

    handleClick() {
        //loading set to true to show the spinner, after set true, the callback function will run
        this.setState(st => ({
            loading: true
        }),
            () => this.getJokes()
        )

        //below is another way to use callback in setState
        //after this.getJokes, DO NOT use ()

        // this.setState({loading : true}, this.getJokes)
    }

    render() {
        //showing the loading spinner
        if (this.state.loading) {
            return (
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin"></i>
                    <h1 className="JokeList-title">Loading</h1>
                </div>
            )
        }

        //sort the jokes base on the votes, higher votes on top
        let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes)
        console.log(jokes)

        return (
            <div className='JokeList'>
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title"><span>Dad</span> Jokes</h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="" />
                    <button
                        className="JokeList-getmore"
                        onClick={this.handleClick}
                    >
                        New Jokes
                    </button>
                </div>
                <div className="JokeList-jokes">
                    {jokes.map(j => (
                        <Joke
                            key={j.id}
                            text={j.text}
                            votes={j.votes}
                            upvote={() => this.handleVote(j.id, 1)}
                            downvote={() => this.handleVote(j.id, -1)}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default JokeList;