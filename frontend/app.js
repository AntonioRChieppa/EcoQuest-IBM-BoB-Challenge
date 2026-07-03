(function () {
  'use strict';

  // =========================================================================
  // Module
  // =========================================================================
  angular.module('ecoQuestApp', []);

  // =========================================================================
  // API_BASE constant — backend runs on :3000, frontend on :4200
  // Change this value if the backend is deployed elsewhere.
  // =========================================================================
  angular.module('ecoQuestApp').constant('API_BASE', 'http://localhost:3000');

  // =========================================================================
  // AppController — top-level state machine: 'login' | 'dashboard'
  // =========================================================================
  angular.module('ecoQuestApp').controller('AppController', [
    '$scope',
    function ($scope) {
      var savedId = localStorage.getItem('user_id');

      $scope.view = savedId ? 'dashboard' : 'login';
      $scope.user = null;

      // Called by <eq-login on-login="...">
      $scope.handleLogin = function (user) {
        localStorage.setItem('user_id', user.id);
        $scope.user = user;
        $scope.view = 'dashboard';
      };

      // Called by <eq-dashboard on-logout="...">
      $scope.handleLogout = function () {
        localStorage.removeItem('user_id');
        $scope.user = null;
        $scope.view = 'login';
      };
    },
  ]);

})();
