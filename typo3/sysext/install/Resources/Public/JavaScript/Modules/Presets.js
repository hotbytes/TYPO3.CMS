/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

/**
 * Module: TYPO3/CMS/Install/Presets
 */
define([
  'jquery',
  'TYPO3/CMS/Install/Router',
  'TYPO3/CMS/Install/FlashMessage',
  'TYPO3/CMS/Install/ProgressBar',
  'TYPO3/CMS/Install/InfoBox',
  'TYPO3/CMS/Install/Severity',
  'TYPO3/CMS/Backend/Notification'
], function($, Router, FlashMessage, ProgressBar, InfoBox, Severity, Notification) {
  'use strict';

  return {
    selectorModalBody: '.t3js-modal-body',
    selectorGetContentToken: '#t3js-presets-getContent-token',
    selectorActivateToken: '#t3js-presets-activate-token',
    selectorActivateTrigger: '.t3js-presets-activate',
    selectorContentContainer: '.t3js-presets-content',
    selectorOutputContainer: '.t3js-presets-output',
    selectorImageExecutable: '.t3js-presets-image-executable',
    selectorImageExecutableTrigger: '.t3js-presets-image-executable-trigger',

    initialize: function(currentModal) {
      var self = this;
      this.currentModal = currentModal;
      self.getContent();

      // Load content on click image executable path button
      currentModal.on('click', this.selectorImageExecutableTrigger, function(e) {
        e.preventDefault();
        self.getContent();
      });

      // Write out selected preset
      currentModal.on('click', this.selectorActivateTrigger, function(e) {
        e.preventDefault();
        self.activate();
      });

      // Automatically select the custom preset if a value in one of its input fields is changed
      currentModal.find('.t3js-custom-preset').on('input', '.t3js-custom-preset', function(e) {
        $('#' + $(this).data('radio')).prop('checked', true);
      });
    },

    getContent: function() {
      var self = this;
      var modalContent = this.currentModal.find(self.selectorModalBody);
      $.ajax({
        url: Router.getUrl('presetsGetContent'),
        cache: false,
        success: function(data) {
          if (data.success === true && data.html !== 'undefined' && data.html.length > 0) {
            modalContent.empty().append(data.html);
          } else {
            Notification.error('Something went wrong');
          }
        },
        error: function(xhr) {
          Router.handleAjaxError(xhr);
        }
      });
    },

    activate: function() {
      var self = this;
      var executeToken = self.currentModal.find(this.selectorActivateToken).text();
      var postData = {};
      $(self.currentModal.find(this.selectorContentContainer + ' form').serializeArray()).each(function() {
        postData[this.name] = this.value;
      });
      postData['install[action]'] = 'presetsActivate';
      postData['install[token]'] = executeToken;
      $.ajax({
        url: Router.getUrl(),
        method: 'POST',
        data: postData,
        cache: false,
        success: function(data) {
          if (data.success === true && Array.isArray(data.status)) {
            data.status.forEach(function(element) {
              Notification.showMessage(element.title, element.message, element.severity);
            });
          } else {
            Notification.error('Something went wrong');
          }
        },
        error: function(xhr) {
          Router.handleAjaxError(xhr);
        }
      });
    }
  };
});
