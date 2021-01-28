import React, {Component} from 'react';
import $ from 'jquery';

import '../stylesheets/FormView.css';

class FormView extends Component {
    constructor(props) {
        super();
        this.state = {
            question: "",
            answer: "",
            difficulty: 1,
            category: 1,
            categories: [],
            type: "",
            username: ""
        }
    }

    componentDidMount() {
        $.ajax({
            url: `http://127.0.0.1:5000/categories`, //TODO: update request URL
            type: "GET",
            success: (result) => {
                this.setState({categories: result.categories});
                return;
            },
            error: (error) => {
                alert('Unable to load categories. Please try your request again')
                return;
            }
        })
    }


    submitQuestion = (event) => {
        event.preventDefault();
        $.ajax({
            url: 'http://127.0.0.1:5000/questions', //TODO: update request URL
            type: "POST",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                question: this.state.question,
                answer: this.state.answer,
                difficulty: this.state.difficulty,
                category: this.state.category
            }),
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: (result) => {
                document.getElementById("add-question-form").reset();
                return;
            },
            error: (error) => {
                alert('Unable to add question. Please try your request again')
                return;
            }
        })
    };

    submitCategory = (event) => {
        event.preventDefault();
        $.ajax({
            url: 'http://127.0.0.1:5000/categories', //TODO: update request URL
            type: "POST",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                type: this.state.type,
            }),
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: (result) => {
                document.getElementById("add-cat-form").reset();
                return;
            },
            error: (error) => {
                alert('Unable to add category. Please try your request again');
                return;
            }
        })
    };

    submitUser = (event) => {
        event.preventDefault();
        $.ajax({
            url: 'http://127.0.0.1:5000/players', //TODO: update request URL
            type: "POST",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                username: this.state.username,
            }),
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: (result) => {
                document.getElementById("add-player-form").reset();
                return;
            },
            error: (error) => {
                alert('Unable to add player. Please try your request again');
                return;
            }
        })
    };

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    render() {
        return (
            <div className="forms-wrapper">
                <div className="form" id="add-form">
                    <h2 className="play-text">Add a New Trivia Question</h2>
                    <form className="form-view" id="add-question-form" onSubmit={this.submitQuestion}>
                        <div className="form-input">
                            <label>Question</label>
                            <input type="text" name="question" onChange={this.handleChange}/>
                        </div>
                        <div className="form-input">
                            <label>Answer</label>
                            <input type="text" name="answer" onChange={this.handleChange}/>
                        </div>
                        <div className="form-input">
                            <label>Difficulty</label>
                            <select className="select" name="difficulty" onChange={this.handleChange}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                        <div className="form-input">
                            <label>Category</label>
                            <select className="select" name="category" onChange={this.handleChange}>
                                {this.state.categories.map(cat => {
                                    return (
                                        <option key={cat.id} value={cat.id}>{cat.type}</option>
                                    )
                                })}
                            </select>
                        </div>
                        <button type="submit" className="play button">Submit</button>
                    </form>
                </div>

                <div className="form" id="add-form">
                    <h2 className="play-text">Add a New Category</h2>
                    <form className="form-view" id="add-cat-form" onSubmit={this.submitCategory}>
                        <div className="form-input">
                            <label>Type</label>
                            <input type="text" name="type" onChange={this.handleChange}/>
                        </div>
                        <button type="submit" className="play button">Submit</button>
                    </form>
                </div>

                <div className="form" id="add-form">
                    <h2 className="play-text">Add a New Player</h2>
                    <form className="form-view" id="add-player-form" onSubmit={this.submitUser}>
                        <div className="form-input">
                            <label>Username</label>
                            <input type="text" name="username" onChange={this.handleChange}/>
                        </div>
                        <button type="submit" className="play button">Submit</button>
                    </form>
                </div>
            </div>

        );
    }
}

export default FormView;
