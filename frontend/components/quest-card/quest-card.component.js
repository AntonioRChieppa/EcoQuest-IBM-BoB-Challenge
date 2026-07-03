(function () {
  'use strict';

  /**
   * quest-card component
   * Renders a single quest row.
   * Emits onClaim({ quest }) when the Claim button is clicked.
   */
  angular.module('ecoQuestApp').component('eqQuestCard', {
    templateUrl: '/components/quest-card/quest-card.component.html',
    bindings: {
      quest:   '<',    // Quest object (one-way)
      onClaim: '&',    // callback({ quest })
    },
    controller: [QuestCardController],
  });

  function QuestCardController() {
    var $ctrl = this;

    $ctrl.isCompleted = function () {
      return $ctrl.quest && $ctrl.quest.status === 'completed';
    };

    $ctrl.claim = function () {
      if ($ctrl.isCompleted() || $ctrl.quest._claiming) return;
      $ctrl.onClaim({ quest: $ctrl.quest });
    };
  }

})();
