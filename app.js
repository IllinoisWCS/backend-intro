angular.module('jeopardyApp', [
    'firebase',
    'ngMaterial',
    'ngRoute',
    'ngSanitize'
])

.config(['$routeProvider', function($routeProvider) {
    /**
     * Routes provide a way for us to navigate from one web view to
     * another. Each view has a different controller. Think of the
     * view as what you see on the web page and the controller controls
     * how that view got generated / how it changes as users interact
     * with the view.
     */
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'MainController'
        })
        .when('/add', {
            templateUrl: 'views/add.html',
            controller: 'AddController'
        })
        .when('/question/:id', {
            templateUrl: 'views/detail.html',
            controller: 'DetailController'
        })
        .when('/list', {
            templateUrl: 'views/list.html',
            controller: 'ListController'
        })
        .otherwise({
            redirectTo: '/'
        });
}])

.factory('Questions', ['$firebaseArray', function($firebaseArray) {
    var reference = firebase.database().ref();
    return $firebaseArray(reference);
}])

.service('QuestionService', ['Questions', function(Questions) {
    return {
        getQuestions: function() {
            return Questions;
        },
        getQuestion: function(index) {
            return Questions.$getRecord(index);
        },
        addQuestion: function(data) {
            return Questions.$add({
                question: data.question,
                answer: data.answer,
                comments: [],
                timestamp: Date.now()
            });
        },
        updateQuestion: function(question) {
            return Questions.$save(question);
        }
    };
}])

.controller('MainController', ['$scope', function($scope) {
    $scope.customMessage = 'Let\'s play Jeopardy.';
}])

.controller('AddController', ['$scope', '$location', 'QuestionService', function($scope, $location, QuestionService) {
    $scope.newQuestion = {};

    $scope.addQuestion = function() {
        if ($scope.newQuestion.answer === undefined) {
            $scope.newQuestion.answer = '';
        }
        QuestionService.addQuestion($scope.newQuestion).then(function(data) {
            $location.path('/');
        }).catch(function(error) {
            $scope.error = 'An error occured. Please try again: ' + error;
        });
    };
}])

.controller('ListController', ['$scope', '$location', 'QuestionService', function($scope, $location, QuestionService) {
    $scope.questions = [];

    $scope.initialize = function() {
        $scope.questions = QuestionService.getQuestions();
    };

    $scope.goto = function(id) {
        $location.path('/question/' + id);
    };
}])

.controller('DetailController', ['$scope', '$routeParams', '$location', 'QuestionService', function($scope, $routeParams, $location, QuestionService) {
    $scope.questionId = $routeParams.id;

    $scope.initialize = function() {
        $scope.question = QuestionService.getQuestion($scope.questionId);
    };

    $scope.updateQuestion = function() {
        QuestionService.updateQuestion($scope.question).then(function () {
            $location.path('/list');
        }).catch(function(error) {
            $scope.error = 'There was the following error: ' + error;
        });
    };
}]);