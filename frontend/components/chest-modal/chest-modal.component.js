(function () {
  'use strict';

  /**
   * chest-modal component
   * Shows the Loot Chest modal. Fetches /api/chest-stats when opened.
   * Bindings: isOpen (one-way), onClose (&).
   */
  angular.module('ecoQuestApp').component('eqChestModal', {
    templateUrl: '/components/chest-modal/chest-modal.component.html',
    bindings: {
      isOpen:  '<',   // boolean
      userId:  '<',   // string
      onClose: '&',   // callback()
    },
    controller: ['$http', 'API_BASE', ChestModalController],
  });

  function ChestModalController($http, API_BASE) {
    var $ctrl = this;

    $ctrl.chest   = null;
    $ctrl.loading = false;

    // Watch isOpen: fetch stats when the modal opens
    $ctrl.$onChanges = function (changes) {
      if (changes.isOpen && changes.isOpen.currentValue === true) {
        $ctrl.fetch();
      }
    };

    $ctrl.fetch = function () {
      if (!$ctrl.userId) return;
      $ctrl.loading = true;
      $ctrl.chest   = null;

      $http.get(API_BASE + '/api/chest-stats/' + $ctrl.userId)
        .then(function (res) { $ctrl.chest = res.data; })
        .catch(function (err) { console.error('chest-stats error', err); })
        .finally(function () { $ctrl.loading = false; });
    };

    $ctrl.close = function () {
      $ctrl.onClose();
    };
  }

})();
