// @ts-check
/**
 * email.gs — Formula Finance v1.0.0
 * Automated email report distribution.
 * Builds and sends HTML email summaries to role-based recipient lists.
 *
 * NAMESPACE: FF.Email
 * TRIGGERS: triggerDaily, triggerWeekly, triggerMonthly
 */

'use strict';

var FF = FF || {};

FF.Email = (function() {

  /**
   * Send all configured email reports.
   * Iterates over config.email.reports and dispatches each one.
   * @param {Object} config - loaded configuration
   * @param {Object} metrics - classified metrics data
   */
  function sendAll(config, metrics) {
    // TODO: implement
    // 1. Check if email is enabled in config
    // 2. For each report config: build HTML, get recipients, send
    FF.Debug.log('INFO', 'Email', 'sendAll called');
  }

  /**
   * Send a single report email.
   * @param {Object} reportConfig - { subject, recipients, template, period }
   * @param {Object} metrics
   */
  function sendReport(reportConfig, metrics) {
    // TODO: implement
    var html = buildHtml(reportConfig, metrics);
    var recipients = getRecipients(reportConfig);
    if (!recipients || recipients.length === 0) {
      FF.Debug.log('WARN', 'Email', 'No recipients for report: ' + reportConfig.subject);
      return;
    }
    GmailApp.sendEmail(
      recipients.join(','),
      reportConfig.subject || 'Formula Finance — Отчёт',
      '',
      { htmlBody: html }
    );
  }

  /**
   * Build HTML body for an email report.
   * @param {Object} reportConfig
   * @param {Object} metrics
   * @returns {string} HTML string
   */
  function buildHtml(reportConfig, metrics) {
    // TODO: implement full HTML template
    return '<h2>Formula Finance</h2><p>Отчёт сформирован: ' + new Date().toLocaleString('ru-RU') + '</p>';
  }

  /**
   * Get recipient email list for a report.
   * @param {Object} reportConfig
   * @returns {string[]}
   */
  function getRecipients(reportConfig) {
    // TODO: implement role-based lookup from config
    return reportConfig.recipients || [];
  }

  return { sendAll, sendReport, buildHtml, getRecipients };

})();
