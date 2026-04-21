// @ts-check
/**
 * email.gs — Formula Finance v1.0.0
 * Automated email report distribution.
 * Builds and sends HTML email summaries to role-based recipient lists.
 *
 * NAMESPACE: FF.Email
 * ROLES: ceo | cfo | ops | general
 */

'use strict';

var FF = FF || {};

FF.Email = (function() {

  /**
   * Send all configured email reports.
   * Reads recipient lists from config.emails.
   * @param {Object} config - loaded FF.Config object
   * @param {Array}  blocks - available blocks from FF.Registry
   * @param {Array}  classifiedSheets - from FF.Classifier
   */
  function sendAll(config, blocks, classifiedSheets) {
    FF.Debug.log('INFO', 'Email', 'sendAll started');

    var reports = [
      { role: 'ceo',     label: 'CEO',     recipients: config.emails.ceo },
      { role: 'cfo',     label: 'CFO',     recipients: config.emails.cfo },
      { role: 'ops',     label: 'Ops',     recipients: config.emails.ops },
      { role: 'general', label: 'General', recipients: config.emails.general }
    ];

    var sent = 0;
    reports.forEach(function(report) {
      if (!report.recipients || report.recipients.length === 0) {
        FF.Debug.log('INFO', 'Email', 'No recipients for role: ' + report.role);
        return;
      }
      try {
        sendReport(report, config, blocks, classifiedSheets);
        sent++;
      } catch(e) {
        FF.Debug.log('ERROR', 'Email', 'Failed to send report for role: ' + report.role, e.message);
      }
    });

    FF.Debug.log('INFO', 'Email', 'Reports sent: ' + sent);
  }

  /**
   * Send a single role-based email report.
   * @param {Object} report   - { role, label, recipients }
   * @param {Object} config
   * @param {Array}  blocks
   * @param {Array}  classifiedSheets
   */
  function sendReport(report, config, blocks, classifiedSheets) {
    var html       = buildHtml(report, config, blocks, classifiedSheets);
    var subject    = _buildSubject(report, config);
    var recipients = report.recipients.join(',');

    GmailApp.sendEmail(recipients, subject, '', { htmlBody: html, name: config.companyName || 'Formula Finance' });
    FF.Debug.log('INFO', 'Email', 'Sent [' + report.role + '] to: ' + recipients);
  }

  /**
   * Build an HTML email body for a report.
   * @param {Object} report
   * @param {Object} config
   * @param {Array}  blocks
   * @param {Array}  classifiedSheets
   * @returns {string}
   */
  function buildHtml(report, config, blocks, classifiedSheets) {
    var companyName = config.companyName || 'Formula Finance';
    var currency    = config.currency    || '₽';
    var ts          = Utilities.formatDate(new Date(), 'Europe/Moscow', 'dd.MM.yyyy HH:mm');
    var available   = blocks.filter(function(b) { return b.isAvailable; });

    var rows = available.map(function(block) {
      var sheets = classifiedSheets.filter(function(sd) {
        return block.requiredTypes.indexOf(sd.reportType) >= 0;
      });
      var sd = sheets[0];
      var value = sd ? _summariseSheet(sd, currency) : '—';
      return '<tr><td style="padding:8px 12px;color:#a0aec0;font-size:13px">' + block.label + '</td>' +
             '<td style="padding:8px 12px;color:#ffffff;font-size:13px;font-weight:bold">' + value + '</td></tr>';
    }).join('');

    return '<!DOCTYPE html><html><body style="background:#0d0d1a;font-family:Arial,sans-serif;margin:0;padding:20px">' +
      '<div style="max-width:600px;margin:0 auto;background:#1a1a2e;border-radius:8px;overflow:hidden">' +
      '<div style="background:#0f3460;padding:20px">' +
      '<h1 style="color:#fff;margin:0;font-size:20px">📊 ' + companyName + '</h1>' +
      '<p style="color:#a0aec0;margin:4px 0 0;font-size:12px">Отчёт для: ' + report.label + ' &nbsp;| ' + ts + '</p>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse">' +
      '<thead><tr>' +
      '<th style="padding:10px 12px;background:#16213e;color:#a0aec0;text-align:left;font-size:11px;text-transform:uppercase">Показатель</th>' +
      '<th style="padding:10px 12px;background:#16213e;color:#a0aec0;text-align:left;font-size:11px;text-transform:uppercase">Значение</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div style="padding:12px;color:#4a5568;font-size:10px;text-align:center">' +
      'Formula Finance — автоматическая рассылка. Не отвечайте на этот email.' +
      '</div></div></body></html>';
  }

  // --- helpers ---

  function _buildSubject(report, config) {
    var company = config.companyName || 'Formula Finance';
    var ts = Utilities.formatDate(new Date(), 'Europe/Moscow', 'dd.MM.yyyy');
    return '[' + company + '] Отчёт для ' + report.label + ' — ' + ts;
  }

  function _summariseSheet(sd, currency) {
    if (!sd || !sd.rows || sd.rows.length === 0) return '—';
    // Try to find and sum a revenue column
    var revenueAliases = ['выручка', 'сумма', 'итог', 'revenue', 'total', 'цена'];
    var col = null;
    sd.headers.forEach(function(h) {
      revenueAliases.forEach(function(alias) {
        if (!col && h.toLowerCase().indexOf(alias) >= 0) col = h;
      });
    });
    if (!col && sd.headers.length > 0) col = sd.headers[sd.headers.length - 1];
    if (!col) return sd.rows.length + ' строк';
    var sum = 0;
    sd.rows.forEach(function(r) {
      var v = r[col];
      if (typeof v === 'number') sum += v;
    });
    return sum > 0 ? sum.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ' + currency : sd.rows.length + ' строк';
  }

  return { sendAll, sendReport, buildHtml };

})();
