/**
 * Created by Jon on 3/4/16.
 */

var app = angular.module("todoApp", []);

app.controller("TodoCtrl", function($scope, $http) {
    $scope.todos = [];
    $scope.newTodo = {};

    $http.get("http://localhost:8529/_db/_system/todoApp/todos")
        .success(function(response) {
            $scope.todos = response;
        })
        .error(function(response) {
            console.error(response);
        });

    $scope.addTodo = function() {
        //$scope.todos.push($scope.newTodo);
        $http.post("http://localhost:8529/_db/_system/todoApp/todos", $scope.newTodo)
            .success(function(response) {
                $scope.todos.push(response);
            })
            .error(function(err) {
                console.error(err);
            });
        $scope.newTodo = {};
    };

});
