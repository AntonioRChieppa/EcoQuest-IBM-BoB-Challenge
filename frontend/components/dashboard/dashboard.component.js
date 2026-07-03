(function () {
  'use strict';

  angular.module('ecoQuestApp').component('eqDashboard', {
    templateUrl: '/components/dashboard/dashboard.component.html',
    bindings: {
      user:     '<',
      onLogout: '&',
    },
    controller: ['$http', '$timeout', 'API_BASE', DashboardController],
  });

  function DashboardController($http, $timeout, API_BASE) {
    var $ctrl = this;

    $ctrl.quests        = [];
    $ctrl.loadingQuests = false;
    $ctrl.leveledUp     = false;
    $ctrl.rankedUp      = false;
    $ctrl.chestOpen     = false;
    $ctrl.generatesLeft  = 8;  // shown in counter; updated from API
    $ctrl.generateClicks = 0;  // total clicks on "Genera" this session

    // ── Lifecycle ─────────────────────────────────────────────────────────
    $ctrl.$onChanges = function (changes) {
      if (changes.user && changes.user.currentValue) {
        $ctrl.loadQuests();
      }
    };

    // ── Helpers ───────────────────────────────────────────────────────────

    /** Returns only active (non-completed) quests of a given type */
    $ctrl.activeByType = function (type) {
      return $ctrl.quests.filter(function (q) {
        return q.type === type && q.status !== 'completed';
      });
    };

    // ── Load quests ───────────────────────────────────────────────────────
    $ctrl.loadQuests = function () {
      var userId = $ctrl.user && $ctrl.user.id;
      if (!userId) return;

      $http.get(API_BASE + '/api/quests/' + userId).then(function (res) {
        $ctrl.quests        = res.data.quests || [];
        $ctrl.generatesLeft = (res.data.generates_left !== undefined)
          ? res.data.generates_left : 3;
      });
    };

    // ── Generate quests ───────────────────────────────────────────────────
    $ctrl.generateQuests = function () {
      var userId = $ctrl.user && $ctrl.user.id;
      if (!userId || $ctrl.generatesLeft <= 0) return;

      $ctrl.loadingQuests  = true;
      $ctrl.leveledUp      = false;
      $ctrl.rankedUp       = false;
      $ctrl.generateClicks += 1;

      $http.post(API_BASE + '/api/generate-quests', { user_id: userId })
        .then(function (res) {
          $ctrl.quests        = res.data.quests || [];
          $ctrl.generatesLeft = (res.data.generates_left !== undefined)
            ? res.data.generates_left : $ctrl.generatesLeft - 1;
        })
        .catch(function (err) {
          var msg = err.data && err.data.error;
          if (msg) { alert(msg); }
          console.error('generate-quests error', err);
        })
        .finally(function () { $ctrl.loadingQuests = false; });
    };

    // ── Claim quest ───────────────────────────────────────────────────────
    $ctrl.claimQuest = function (quest) {
      var userId = $ctrl.user && $ctrl.user.id;
      if (!userId || quest.status === 'completed') return;

      quest._claiming = true;

      $http.post(API_BASE + '/api/claim-quest', { user_id: userId, quest_id: quest.id })
        .then(function (res) {
          // Remove the completed quest from the active list immediately
          $ctrl.quests = $ctrl.quests.filter(function (q) { return q.id !== quest.id; });

          // Update user data in-place (XP, level, class)
          angular.extend($ctrl.user, res.data.user);

          if (res.data.rank_up) {
            $ctrl.rankedUp  = true;
            $ctrl.leveledUp = true;
            // auto-dismiss after 8 s (user can also click "Continua")
            $timeout($ctrl.dismissAlert, 8000);
          } else if (res.data.leveled_up) {
            $ctrl.leveledUp = true;
            $timeout($ctrl.dismissAlert, 6000);
          }
        })
        .catch(function (err) { console.error('claim-quest error', err); })
        .finally(function () { quest._claiming = false; });
    };

    // ── Dismiss level-up / rank-up alert ──────────────────────────────────
    $ctrl.dismissAlert = function () {
      $ctrl.leveledUp = false;
      $ctrl.rankedUp  = false;
    };

    // ── Chest modal ───────────────────────────────────────────────────────
    $ctrl.openChest  = function () { $ctrl.chestOpen = true; };
    $ctrl.closeChest = function () { $ctrl.chestOpen = false; };

    // ── Logout ────────────────────────────────────────────────────────────
    $ctrl.logout = function () { $ctrl.onLogout(); };
  }

})();
