(function () {
  'use strict';

  /**
   * login component
   * Two-tab auth view: Register (username, password, age, gender)
   *                    Login    (username, password)
   * Emits onLogin({ user }) on success.
   */
  angular.module('ecoQuestApp').component('eqLogin', {
    templateUrl: '/components/login/login.component.html',
    bindings: {
      onLogin: '&',   // callback({ user })
    },
    controller: ['$http', 'API_BASE', LoginController],
  });

  function LoginController($http, API_BASE) {
    var $ctrl = this;

    $ctrl.tab      = 'login';   // 'login' | 'register'
    $ctrl.loading  = false;
    $ctrl.error    = '';

    $ctrl.loginForm    = { username: '', password: '' };
    $ctrl.registerForm = { username: '', password: '', age: null, gender: '' };

    $ctrl.switchTab = function (tab) {
      $ctrl.tab   = tab;
      $ctrl.error = '';
    };

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------
    $ctrl.login = function () {
      $ctrl.loading = true;
      $ctrl.error   = '';

      $http.post(API_BASE + '/api/auth/login', {
        username: $ctrl.loginForm.username,
        password: $ctrl.loginForm.password,
      })
        .then(function (res) {
          $ctrl.onLogin({ user: res.data.user });
        })
        .catch(function (err) {
          $ctrl.error = (err.data && err.data.error) || 'Errore di connessione.';
        })
        .finally(function () { $ctrl.loading = false; });
    };

    // -------------------------------------------------------------------------
    // Register
    // -------------------------------------------------------------------------
    $ctrl.register = function () {
      $ctrl.loading = true;
      $ctrl.error   = '';

      $http.post(API_BASE + '/api/auth/register', {
        username: $ctrl.registerForm.username,
        password: $ctrl.registerForm.password,
        age:      $ctrl.registerForm.age,
        gender:   $ctrl.registerForm.gender,
      })
        .then(function (res) {
          $ctrl.onLogin({ user: res.data.user });
        })
        .catch(function (err) {
          $ctrl.error = (err.data && err.data.error) || 'Errore di connessione.';
        })
        .finally(function () { $ctrl.loading = false; });
    };
  }

})();
