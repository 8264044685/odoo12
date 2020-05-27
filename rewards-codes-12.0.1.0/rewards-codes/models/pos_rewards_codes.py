# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models
import json

class RewardsCodesConfig(models.Model):

    _name = 'rewardscodes.config'
    _description = 'Rewards Codes Config'

    phone = fields.Char('Owner Phone', required=True, help='This phone will be associated to your company')
    code = fields.Char("Phone's code", required=True, help='This is default phone code. Ej. +52 or +1')
    api_key = fields.Char('API Key', required=True, help='This developer key allows the connection to Rewards Codes')

    @api.model
    def get_all(self):
        rwc_config = self.env['rewardscodes.config'].search([])
        data = {
            'phone': rwc_config.mapped('phone'),
            'code': rwc_config.mapped('code'),
            'api_key': rwc_config.mapped('api_key'),
        }
        return json.dumps(data)