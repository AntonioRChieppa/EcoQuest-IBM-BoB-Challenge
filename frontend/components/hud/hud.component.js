(function () {
  'use strict';

  /**
   * hud component
   * Displays username, rpg_class, level, XP bar (per-level) and Loot Chest button.
   * XP bar shows xp_current_level / 150 — resets to 0 on each level-up.
   */
  angular.module('ecoQuestApp').component('eqHud', {
    templateUrl: '/components/hud/hud.component.html',
    bindings: {
      user:        '<',   // User object (one-way)
      onOpenChest: '&',   // callback()
    },
    controller: [HudController],
  });

  function HudController() {
    var $ctrl        = this;
    var XP_PER_LEVEL = 500;
    var MAX_LEVEL    = 15;

    $ctrl.XP_PER_LEVEL = XP_PER_LEVEL;
    $ctrl.MAX_LEVEL    = MAX_LEVEL;

    /** True when the player has reached the level cap */
    $ctrl.isMaxLevel = function () {
      return $ctrl.user && $ctrl.user.level >= MAX_LEVEL;
    };

    /**
     * Fill % for the XP bar.
     * At MAX_LEVEL always returns 100 so the bar appears full.
     */
    $ctrl.xpPercent = function () {
      if (!$ctrl.user) return 0;
      if ($ctrl.isMaxLevel()) return 100;
      var current = $ctrl.user.xp_current_level || 0;
      return Math.min(100, Math.round((current / XP_PER_LEVEL) * 100));
    };
  }

})();
