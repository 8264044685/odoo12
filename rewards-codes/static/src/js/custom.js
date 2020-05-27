odoo.define('custom-button.custom_button', function (require) {
"use strict";
var core = require('web.core');
var screens = require('point_of_sale.screens');
var PosBaseWidget = require('point_of_sale.BaseWidget');
var gui = require('point_of_sale.gui');
var models = require('point_of_sale.models');
var rpc = require('web.rpc');


var ReceiptScreenWidget = screens.ReceiptScreenWidget.include({

    reward_customer: function(partner, customer, apiKey, rwc) {

        $('body').append(`
            <div class="rwc-loader-container">
                <div class="rwc-loader"></div>
            </div>
        `);

        var url = 'https://apig.systems:8000/rwc/add_reward?id=' + partner.replace('+', '%2B');
        var body = {
            'phone_id': customer,
            'date': "2019-01-18",
            'quantity': rwc
        }

        $.ajax({
            type: "POST",
            url: url,
            data: JSON.stringify(body),
            headers: {
                'rwc-id': apiKey,
                'Content-Type':'application/json'
            },
            success: function(){
                $('.rwc-loader-container').remove();
                $('.button.print').parent().prepend(`
                    <div class="rwc-message" style="text-align: center; font-size: 25px; color: green;">
                        Customer Rewarded!
                    </div>
                `);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                $('.rwc-loader-container').remove();
                $('.button.print').parent().prepend(`
                    <div class="rwc-message" style="text-align: center; font-size: 25px; color: red;">
                        Error!
                    </div>
                `);
            }
        });
    },
    renderRewardsCodesElements: function() {
        var self = this;

        $('head').append(`
            <style>
                .rwc-loader-container {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    background-color: #00000085;
                }

                .rwc-loader {
                    position: absolute;
                    margin: auto;
                    left: 0;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    border: 4px solid#f3f3f3;
                    border-radius: 50%;
                    border-top: 4px solid#72246c;
                    width: 80px;
                    height: 80px;
                    -webkit-animation: rwc-spin 2s linear infinite; /* Safari */
                    animation: rwc-spin 2s linear infinite;
                }

                /* Safari */
                @-webkit-keyframes rwc-spin {
                    0% { -webkit-transform: rotate(0deg); }
                    100% { -webkit-transform: rotate(360deg); }
                }

                @keyframes rwc-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `);
        
        if($( ".rewards" ).length == 0) {
            $('.button.print_invoice').parent().prepend(`
                <div class="button rewards" style="background-color: #72246c; color: white;">
                    <i class="fa fa-gift"></i>&nbsp; Reward Customer
                </div>
            `);

            $('.rewards').click(function(){
                if (!self._locked) {
    
                    $('.rwc-message').remove();
                    rpc.query({
                        model: 'rewardscodes.config',
                        method: 'get_all',
                    })
                    .then(function(response, something){
                        var data = JSON.parse(response);
    
                        var partner = data['phone'][0];
                        var api_key = data['api_key'][0];
                        var code = data['code'][0];
                        var rwc = 1;
    
                        console.log("EXECUTING")
                        var number = prompt("Enter the customer number to give " + rwc + " rwc:", code);
                        if (number == null) return;
                        if(number.length < 7) {
                            $('.button.print').parent().prepend(`
                                <div class="rwc-message" style="text-align: center; font-size: 25px; color: red;">
                                    Enter a valid phone!
                                </div>
                            `);
                            return;
                        }
    
                        self.reward_customer(code + partner, number, api_key, rwc);
                    });
                }
            });
        }
    },
    renderElement: function() {
        var self = this;
        this._super();

        rpc.query({
            model: 'rewardscodes.config',
            method: 'get_all',
        })
        .then(function(response, something){
            var data = JSON.parse(response);

            var partner = data['phone'][0];
            var api_key = data['api_key'][0];
            var code = data['code'][0];

            if(![partner, api_key, code].includes(undefined)) {
                self.renderRewardsCodesElements();
            } 
        });
    }
});

var PaymentScreenWidget = screens.PaymentScreenWidget.include({
    set_up: function() {
        rpc.query({
            model: 'rewardscodes.config',
            method: 'get_all',
        })
        .then(function(response, something){
            var data = JSON.parse(response);

            var partner = data['phone'][0];
            var api_key = data['api_key'][0];
            var code = data['code'][0];

            if([partner, api_key, code].includes(undefined)) {
                $('.actionpad').parent().prepend(`
                    <div class="rwc-message" style="text-align: center; font-size: 25px; color: red;">
                        REWARDS CODES HAS NOT BEEN CONFIGURED
                    </div>
                `);
            }
            
        });
    },
    get_total_rwc: function() {
        let rwc = 0;
        $('.orderline > span.product-name').each((index, element) => {
            var text = $(element).text();
            if(text.indexOf('rwc') == -1) return;
            text = text.replace(/\s+/g, '');

            var quantity = parseFloat($(element).parent().find('ul.info-list > li > em').text());
            rwc += parseFloat(text.match(/\d+rwc/i)[0].replace('rwc', '')) * quantity;
        });
        return rwc;
    },
    show_loader: function() {
        $('body').append(`  
            <div class="rwc-loader-container"><div class="rwc-loader"></div></div>
        `);
    },
    hide_loader: function() {
        $('.rwc-loader-container').remove();
    },
    show_error: function(message) {
        $('div.payment-screen').prepend(`
            <div class="rwc-message" style="margin-top: 10px; text-align: center; font-size: 25px; color: red;">${message}</div>
        `);
    },
    hide_error: function() {
        $('.rwc-message').remove();
    },
    reedem_customer: function(partner, customer, apiKey, rwc, customerCode) {
        var self = this;

        self.show_loader();

        var url = 'https://apig.systems:8000/rwc/add_redeem?id=' + partner.replace('+', '%2B');
        var body = {
            'phone_id': customer,
            'date': "2019-01-18",
            'quantity': rwc,
            'code': customerCode
        }

        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(body),
            headers: {
                'rwc-id': apiKey,
                'Content-Type': 'application/json'
            },
            success: function(response) {
                self.hide_loader();
                if(response['status'] === 'error') self.show_error(response['message']);
                else self.finalize_validation();
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                self.hide_loader();
                self.show_error('Invalid phone');
            }
        });
    },
    renderElement: function() {
        var self = this;
        this._super();

        self.set_up();

        this.$('.next').unbind();
        this.$('.next').click(function(){
            
            if (self.order_is_valid()) {
                self.hide_error();
                rpc.query({
                    model: 'rewardscodes.config',
                    method: 'get_all',
                })
                .then(function(response, something){
                    var data = JSON.parse(response);
                    let rwc = self.get_total_rwc();
                    var partner = data['phone'][0];
                    var api_key = data['api_key'][0];
                    var code = data['code'][0];

                    if(rwc === 0 || [partner, api_key, code].includes(undefined)) {
                        self.validate_order();
                        return;
                    }

                    var number = prompt('Enter the customer number to redeem ' + rwc + ' RwC:', code);
                    if (number == null) return;
                    if(number.length < 7) {
                        self.show_error('Enter a valid phone!');
                        return;
                    }

                    var customerCode = prompt(`Enter the customer code:`);
                    if (customerCode == null) return;
                    if(customerCode.length < 3) {
                        self.show_error('Enter a valid code!');
                        return;
                    }

                    self.reedem_customer(code + partner, number, api_key, rwc, customerCode);
                });

                
            }
        });

    }

});

});



