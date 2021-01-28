import os
from flask import Flask, request, abort, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import random
import sys

from sqlalchemy import func

from models import setup_db, Question, Category, Player

sys.path.append("..")
QUESTIONS_PER_PAGE = 10


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__)
    setup_db(app)
    db = SQLAlchemy(app)

    CORS(app, resources={r"/*": {"origins": "*"}})

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Credentials', 'true')

        return response

    # ----------------------------------------------------------------------------#
    #  Get Categories
    # ----------------------------------------------------------------------------#

    @app.route('/categories', methods=['GET'])
    def get_categories():
        categories = Category.query.all()
        formatted_categories = [i.format() for i in categories]

        return jsonify(
            {
                'successful': True,
                'categories': formatted_categories,
                'total_categories': len(formatted_categories)
            }
        )

    @app.route('/categories', methods=['POST'])
    def add_category():
        cat_type = request.get_json()['type']
        find_cat = Category.query.filter(func.lower(Category.type) == cat_type.lower()).all()
        if len(find_cat) == 0:
            try:
                new_cat = Category(
                    type=cat_type
                )
                db.session.add(new_cat)
                db.session.commit()
            except:
                db.session.rollback()
            finally:
                db.session.close()
            return jsonify({
                "success": True
            })
        else:
            return jsonify({
                "success": False,
                "error": "400",
                "message": "unable to process request"
            }), 400

    '''
    @TODO: 
    Create an endpoint to handle GET requests for questions, 
    including pagination (every 10 questions). 
    This endpoint should return a list of questions, 
    number of total questions, current category, categories. 

    TEST: At this point, when you start the application
    you should see questions and categories generated,
    ten questions per page and pagination at the bottom of the screen for three pages.
    Clicking on the page numbers should update the questions. 
    '''

    @app.route('/questions', methods=['GET'])
    def get_questions():
        page = request.args.get('page', 1, type=int)
        start = (page - 1) * 10
        end = start + 10
        questions = Question.query.all()
        formatted_questions = [i.format() for i in questions]
        categories = Category.query.all()
        formatted_categories = [i.format() for i in categories]

        return jsonify(
            {
                'success': True,
                'questions': formatted_questions[start:end],
                'total_questions': len(questions),
                'categories': formatted_categories,
                'current_category': 'All'
            }
        )

    # ----------------------------------------------------------------------------#
    #  Delete Question
    # ----------------------------------------------------------------------------#

    @app.route('/questions/<int:question_id>', methods=['DELETE'])
    def delete_question(question_id):
        question = Question.query.get(question_id)
        question.delete()
        return jsonify({'success': True})

    # ----------------------------------------------------------------------------#
    #  Add Question
    # ----------------------------------------------------------------------------#

    @app.route('/questions', methods=['POST'])
    def add_questions():
        form_data = request.get_json()
        error = False
        try:
            new_question = Question(
                question=form_data['question'],
                answer=form_data['answer'],
                difficulty=form_data['difficulty'],
                category=form_data['category']
            )
            db.session.add(new_question)
            db.session.commit()
        except:
            error = True
            db.session.rollback()
        finally:
            db.session.close()
        if error:
            abort(400)
        else:
            return jsonify({
                "message": "successful"
            })

    # ----------------------------------------------------------------------------#
    #  Questions Search
    # ----------------------------------------------------------------------------#

    @app.route('/search', methods=['POST'])
    def search_questions():
        search_term = request.get_json()['searchTerm']
        questions = db.session.query(Question).filter(func.lower(Question.question).contains(search_term.lower())).all()
        page = request.args.get('page', 1, type=int)
        start = (page - 1) * 10
        end = start + 10
        formatted_questions = [i.format() for i in questions]
        categories = Category.query.all()
        formatted_categories = [i.format() for i in categories]

        return jsonify({
            'success': True,
            'questions': formatted_questions[start:end],
            'total_questions': len(questions),
            'categories': formatted_categories,
            'current_category': 'All'
        })

    # ----------------------------------------------------------------------------#
    #  Questions by category
    # ----------------------------------------------------------------------------#

    @app.route('/categories/<int:cat_id>/questions')
    def get_category_questions(cat_id):
        page = request.args.get('page', 1, type=int)
        start = (page - 1) * 10
        end = start + 10
        questions = Question.query.filter_by(category=str(cat_id)).all()
        formatted_questions = [i.format() for i in questions]
        categories = Category.query.all()
        formatted_categories = [i.format() for i in categories]

        return jsonify(
            {
                'successful': True,
                'questions': formatted_questions[start:end],
                'total_questions': len(questions),
                'categories': formatted_categories,
                'current_category': cat_id
            }
        )

    # ----------------------------------------------------------------------------#
    #  Quizzes
    # ----------------------------------------------------------------------------#

    @app.route('/quizzes', methods=['POST'])
    def quizzes():
        form_data = request.get_json()
        previous_questions = form_data['previous_questions']
        quiz_category = form_data['quiz_category']
        cat_id = quiz_category['id']
        res = {}
        questions = Question.query.filter(Question.id.notin_(previous_questions)).all()
        if cat_id > 0:
            questions = Question.query.filter_by(category=cat_id).filter(Question.id.notin_(previous_questions)).all()

        if len(questions) > 0:
            res['question'] = random.choice([i.format() for i in questions])

        return jsonify(res)

    # ----------------------------------------------------------------------------#
    #  Players
    # ----------------------------------------------------------------------------#

    @app.route('/players', methods=['POST'])
    def add_player():
        username = request.get_json()['username']
        find_cat = Player.query.filter(func.lower(Player.username) == username.lower()).all()
        # If username doesn't exist, add new player
        if len(find_cat) == 0:
            try:
                new_player = Player(
                    username=username,
                    total_score=0
                )
                db.session.add(new_player)
                db.session.commit()
            except:
                db.session.rollback()
            finally:
                db.session.close()
            return jsonify({
                "success": True
            })
        else:
            return jsonify({
                "success": False,
                "error": "400",
                "message": "unable to process request"
            }), 400

    @app.route('/players', methods=['GET'])
    def get_players():
        players = Player.query.order_by(Player.total_score.desc()).all()

        return jsonify(
            {
                'successful': True,
                'players': [i.format() for i in players],
                'total_players': len(players),
            }
        )

    @app.route('/players/<int:player_id>/score', methods=['POST'])
    def score_player(player_id):
        score = request.get_json()['score']
        player = Player.query.get(player_id)
        # Update player's total score
        player.total_score = player.total_score + score
        player.update()

        return jsonify(
            {
                'successful': True,
            }
        )

    # ----------------------------------------------------------------------------#
    #  Error Handling
    # ----------------------------------------------------------------------------#

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "404",
            "message": "resource not found"
        }), 404

    @app.errorhandler(400)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "400",
            "message": "unable to process request"
        }), 400

    @app.errorhandler(422)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "422",
            "message": "unprocessable data"
        }), 422

    return app
