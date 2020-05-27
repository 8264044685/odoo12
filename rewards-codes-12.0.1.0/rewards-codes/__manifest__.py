# -*- coding: utf-8 -*-


{
    'name': 'Rewards Codes Visits',
    'version': '1.0',
    'category': 'Point of Sale',
    'sequence': 1,
    'summary': 'Reward your customers for their loyalty with visits mode',
    'description': """
        - Rewarding a customer after an order has been processed
    """,
    'depends': ['point_of_sale'],
    'author': 'Rewards Codes',
    'maintainer': 'Rewards Codes',
    'company': 'Rewards Codes',
    'website': 'https://rewards.codes/',
    'data': [
        'security/ir.model.access.csv',
        'views/pos_rewards_views.xml',
    ],
    'qweb': [
        'static/src/xml/custom_button.xml',
    ],
    'images': ['static/description/banner.png'],
    'demo': [],
    'installable': True,
    'auto_install': False,
    'license': 'AGPL-3',
}
