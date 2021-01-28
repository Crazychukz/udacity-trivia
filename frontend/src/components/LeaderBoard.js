import React, {Component} from 'react';
import $ from 'jquery';
import QuestionView from "./QuestionView";

const hostURL = 'http://127.0.0.1:5000';


class LeaderBoard extends Component {
    constructor() {
        super();
        this.state = {
            players: [],
            totalPlayers: 0
        }
    }

    componentDidMount() {
        this.getPlayers();
    }

    getPlayers = () => {
        $.ajax({
            url: hostURL + `/players`,
            type: "GET",
            success: (result) => {
                this.setState({
                    players: result.players,
                    totalPlayers: result.total_players,
                });
                return;
            },
            error: (error) => {
                alert('Unable to load players. Please try your request again');
                return;
            }
        })
    };

    render() {
        return (
            <div className="quiz-play-holder">
                <div className="play-text">Leader Board</div>
                <div className="category-holder">
                    {(this.state.players).map(player => {
                        return (
                            <div
                                key={player.id}
                                value={player.id}
                                className="play-category"
                            >
                                {player.username}
                                <span className="total_score">{player.total_score}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}


export default LeaderBoard;