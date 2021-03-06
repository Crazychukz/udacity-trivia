import React, {Component} from 'react';

import '../stylesheets/App.css';
import Question from './Question';
import Search from './Search';
import $ from 'jquery';

const hostURL = 'http://127.0.0.1:5000';

class QuestionView extends Component {
    constructor() {
        super();
        this.state = {
            questions: [],
            page: 1,
            totalQuestions: 0,
            categories: [],
            currentCategory: null,
        }
    }

    componentDidMount() {
        this.getQuestions();
    }

    getQuestions = () => {
        $.ajax({
            url: hostURL + `/questions?page=${this.state.page}`,
            type: "GET",
            success: (result) => {
                this.setState({
                    questions: result.questions,
                    totalQuestions: result.total_questions,
                    categories: result.categories,
                    currentCategory: result.current_category
                });
                return;
            },
            error: (error) => {
                alert('Unable to load questions. Please try your request again');
                return;
            }
        })
    };

    selectPage(num) {
        this.setState({page: num}, () => this.getQuestions());
    }

    createPagination() {
        let pageNumbers = [];
        let maxPage = Math.ceil(this.state.totalQuestions / 10);
        for (let i = 1; i <= maxPage; i++) {
            pageNumbers.push(
                <span
                    key={i}
                    className={`page-num ${i === this.state.page ? 'active' : ''}`}
                    onClick={() => {
                        this.selectPage(i)
                    }}>{i}
        </span>)
        }
        return pageNumbers;
    }

    getByCategory = (id) => {
        $.ajax({
            url: hostURL + `/categories/${id}/questions`,
            type: "GET",
            success: (result) => {
                this.setState({
                    questions: result.questions,
                    totalQuestions: result.total_questions,
                    currentCategory: result.current_category
                });
                return;
            },
            error: (error) => {
                alert('Unable to load questions. Please try your request again');
                return;
            }
        })
    };

    submitSearch = (searchTerm) => {
        $.ajax({
            url: hostURL + `/search`,
            type: "POST",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({searchTerm: searchTerm}),
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: (result) => {
                this.setState({
                    questions: result.questions,
                    totalQuestions: result.total_questions,
                    currentCategory: result.current_category
                });
                return;
            },
            error: (error) => {
                alert('Unable to load questions. Please try your request again');
                return;
            }
        })
    };

    questionAction = (id) => (action) => {
        if (action === 'DELETE') {
            if (window.confirm('are you sure you want to delete the question?')) {
                $.ajax({
                    url: hostURL + `/questions/${id}`,
                    type: "DELETE",
                    success: (result) => {
                        this.getQuestions();
                    },
                    error: (error) => {
                        alert('Unable to load questions. Please try your request again');
                        return;
                    }
                })
            }
        }
    }

    render() {
        return (
            <div className="question-view">
                <div className="categories-list">
                    <h3 className="play-text" onClick={() => {
                        this.getQuestions()
                    }}>Categories</h3>
                    <ul>
                        {(this.state.categories).map((cat,) => (
                            <li key={cat.id} onClick={() => {
                                this.getByCategory(cat.id)
                            }}>
                                <img className="category" src={`${cat.type}.svg`}/>
                                {cat.type}
                            </li>
                        ))}
                    </ul>
                    <Search submitSearch={this.submitSearch}/>
                </div>
                <div className="questions-list">
                    <h3 className="play-text">Questions</h3>
                    {this.state.questions.map((q, ind) => (
                        <Question
                            key={q.id}
                            question={q.question}
                            answer={q.answer}
                            category={this.state.categories.find(item => item.id === q.category).type}
                            difficulty={q.difficulty}
                            questionAction={this.questionAction(q.id)}
                        />
                    ))}
                    <div className="pagination-menu">
                        {this.createPagination()}
                    </div>
                </div>

            </div>
        );
    }
}

export default QuestionView;
