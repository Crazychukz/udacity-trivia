import React, {Component} from 'react';
import $ from 'jquery';

import '../stylesheets/QuizView.css';

const questionsPerPlay = 5;
const hostURL = 'http://127.0.0.1:5000';

class QuizView extends Component {
    constructor(props) {
        super();
        this.state = {
            quizCategory: null,
            previousQuestions: [],
            showAnswer: false,
            categories: [],
            players: [],
            numCorrect: 0,
            currentQuestion: {},
            guess: '',
            forceEnd: false,
            player: 0
        }
    }

    componentDidMount() {
        $.ajax({
            url: hostURL + `/categories`,
            type: "GET",
            success: (result) => {
                this.setState({categories: result.categories});
                return;
            },
            error: (error) => {
                alert('Unable to load categories. Please try your request again');
                return;
            }
        });
        $.ajax({
            url: hostURL + `/players`,
            type: "GET",
            success: (result) => {
                this.setState({players: result.players});
            },
            error: (error) => {
                alert('Unable to load players. Please try your request again');
            }
        })
    }

    selectCategory = ({type, id = 0}) => {
        this.setState({quizCategory: {type, id}}, this.getNextQuestion)
    };

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    getNextQuestion = () => {
        const previousQuestions = [...this.state.previousQuestions];
        if (this.state.currentQuestion.id) {
            previousQuestions.push(this.state.currentQuestion.id)
        }

        $.ajax({
            url: hostURL + '/quizzes', //TODO: update request URL
            type: "POST",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                previous_questions: previousQuestions,
                quiz_category: this.state.quizCategory
            }),
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: (result) => {
                this.setState({
                    showAnswer: false,
                    previousQuestions: previousQuestions,
                    currentQuestion: result.question,
                    guess: '',
                    forceEnd: result.question ? false : true
                });
                // Check if game has ended and user is not anonymous, then update player's score
                if (this.state.forceEnd && this.state.player > 0) {
                    $.ajax({
                        url: hostURL + `/players/${this.state.player}/score`,
                        type: "POST",
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            score: this.state.numCorrect,
                        }),
                        xhrFields: {
                            withCredentials: true
                        },
                        crossDomain: true,
                        success: (result) => {
                        },
                        error: (error) => {
                        }
                    })
                }
                return;
            },
            error: (error) => {
                alert('Unable to load question. Please try your request again');
                return;
            }
        })
    };

    submitGuess = (event) => {
        event.preventDefault();
        const formatGuess = this.state.guess.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
        let evaluate = this.evaluateAnswer();
        this.setState({
            numCorrect: !evaluate ? this.state.numCorrect : this.state.numCorrect + 1,
            showAnswer: true,
        })
    };

    restartGame = () => {
        this.setState({
            quizCategory: null,
            previousQuestions: [],
            showAnswer: false,
            numCorrect: 0,
            currentQuestion: {},
            guess: '',
            forceEnd: false
        })
    };

    renderPrePlay() {
        return (
            <div className="quiz-play-holder">
                <div className="play-text">Choose A Player</div>
                <div className="spaced">
                    <select className="select" name="category" onChange={this.handleChange}>
                        <option key={0} value={0} onChange={this.state.player = 0}>Anonymous</option>
                        {this.state.players.map(player => {
                            return (
                                <option key={player.id} value={player.id}
                                        onChange={this.state.player = player.id}>{player.username}</option>
                            )
                        })}
                    </select>
                </div>
                <br/>
                <div className="play-text">Choose Category</div>
                <div className="category-holder">
                    <div className="play-category" onClick={this.selectCategory}>ALL</div>
                    {(this.state.categories).map(cat => {
                        return (
                            <div
                                key={cat.id}
                                value={cat.id}
                                className="play-category"
                                onClick={() => this.selectCategory({type: cat.type, id: cat.id})}>
                                <img className="category" src={`${cat.type}.svg`}/>
                                {cat.type}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    renderFinalScore() {
        return (
            <div className="quiz-play-holder">
                <div className="final-header"> Your Final Score is {this.state.numCorrect}</div>
                <button className="play button" onClick={this.restartGame}> Play Again?</button>
            </div>
        )
    }

    evaluateAnswer = () => {
        const formatGuess = this.state.guess.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase()
        const answerArray = this.state.currentQuestion.answer.toLowerCase().split(' ');
        return answerArray.includes(formatGuess)
    };

    renderCorrectAnswer() {
        const formatGuess = this.state.guess.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase()
        let evaluate = this.evaluateAnswer()
        return (
            <div className="quiz-play-holder">
                <div className="quiz-body">
                    <div>
                        <div className="quiz-question">{this.state.currentQuestion.question}</div>
                        <div
                            className={`${evaluate ? 'correct' : 'wrong'}`}>{evaluate ? "You were correct!" : "You were incorrect"}</div>
                        <div className="quiz-answer">{this.state.currentQuestion.answer}</div>
                        <button className="play button" onClick={this.getNextQuestion}> Next Question</button>
                    </div>
                </div>
            </div>

        )
    }

    renderPlay() {
        return this.state.previousQuestions.length === questionsPerPlay || this.state.forceEnd
            ? this.renderFinalScore()
            : this.state.showAnswer
                ? this.renderCorrectAnswer()
                : (
                    <div className="quiz-play-holder">
                        <div className="quiz-body">
                            <div>
                                <div className="quiz-question">{this.state.currentQuestion.question}</div>
                                <form onSubmit={this.submitGuess}>
                                    <input type="text" name="guess" onChange={this.handleChange}/>
                                    <button className="submit-guess button play" type="submit">Submit Answer</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
    }


    render() {
        return this.state.quizCategory
            ? this.renderPlay()
            : this.renderPrePlay()
    }
}

export default QuizView;
