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

/**
 * In Angular land, the source of all of our data is encapsulated in an object
 * called a factory. So think of a factory as producing similarly structured pieces of data.
 *
 * So, the source of all of our data is Firebase. This is how we access the Firebase database of the Firebase project we
 * initialized in index.html. We can then interact with the objects of this Firebase database as if it were an array.
 * That is why we use $firebaseArray, which is a service provided to us from AngularFire, the library that incorporates common Firebase functionality
 * with AngularJS.
 * THis is our model.
 */
.factory('Questions', ['$firebaseArray', function($firebaseArray) {
    var reference = firebase.database().ref();
    return $firebaseArray(reference);
}])

/**
 * In Angular land, the API that allows us to request certain data and do certain things to certain data points is encapsulated in a service.
 * We can do things like retrieve all of the data points to display back to the user. We can update a data point. We can add a new data point.
 */
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

/**
 * Angular controllers are the interfaces between the service (API) and the view (all of those views/html files)
 * See the last tutorial (web-II-complete) for more explanations on the specific data binding constructs we use.
 */
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