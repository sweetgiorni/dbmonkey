// Common api dictionaries
pleasanton = {
    "Name": "Shipping Department",
    "Phone": {
        "Number": "8002374200"
    },
    "ShipperNumber": GM_getValue('ups_account_number'),
    "Address": {
        "AddressLine": "1241 Quarry Lane Suite 115",
        "City": "Pleasanton",
        "StateProvinceCode": "CA",
        "PostalCode": "94566",
        "CountryCode": "US"
    }
};
tempe = {
    "Name": "Shipping Department",
    "Phone": {
        "Number": "8002374200"
    },
    "ShipperNumber": GM_getValue('ups_account_number'),
    "Address": {
        "AddressLine": "1500 N Priest Drive Suite 122",
        "City": "Tempe",
        "StateProvinceCode": "AZ",
        "PostalCode": "85281",
        "CountryCode": "US"
    }
};
edwardsville = {
    "Name": "Shipping Department",
    "Phone": {
        "Number": "8002374200"
    },
    "ShipperNumber": GM_getValue('ups_account_number'),
    "Address": {
        "AddressLine": "110 North Research Drive",
        "City": "Edwardsville",
        "StateProvinceCode": "IL",
        "PostalCode": "62025",
        "CountryCode": "US"
    }
};
lab_dict = {
    'pleasanton': pleasanton,
    'tempe': tempe,
    'edwardsville': edwardsville
}
service_codes = {
    '03': 'UPS Ground',
    '01': 'UPS Next Day Air',
    '02': 'UPS 2nd Day Air',
    '59': 'UPS 2nd Day Air A.M.',
    '12': 'UPS 3 Day Select',
    '14': 'UPS Next Day Air Early',
    '13': 'UPS Next Day Air Saver'
};

UPSSecurity = {
    "UsernameToken": {
        "Username": GM_getValue('ups_username'),
        "Password": GM_getValue("ups_password")
    },
    "ServiceAccessToken": {
        "AccessLicenseNumber": GM_getValue("ups_api_key")
    }
}
Package = {
    "Description": "Hard drive",
    'ReferenceNumber': {
        'Value': case_id
    },
    "PackagingType": {
        "Code": "02",
        "Description": "Customer Supplied"
    },
    "Packaging": {
        "Code": "02",
        "Description": "Customer Supplied"
    },
    "Dimensions": {
        "UnitOfMeasurement": {
            "Code": "IN",
            "Description": "Inches"
        },
        "Length": "10",
        "Width": "7",
        "Height": "5"
    },
    "PackageWeight": {
        "UnitOfMeasurement": {
            "Code": "LBS",
            "Description": "Pounds"
        },
        "Weight": "3"
    }
}

class Address {
    constructor(name = "",
        attn = "",
        address_line = "",
        city = "", // PoliticalDivision2
        state = "", // PoliticalDivision1
        zip = "", // PoliticalDivision2
        zip_extension = "", // PostcodeExtendedLow
        country_code = "US", // CountryCode,
        email = ""
    ) {
        this.name = name;
        this.attn = attn;
        this.address_line = address_line;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.country_code = country_code;
        this.email = email;
    }

    ToXml() {
        return {
            "Name": this.name,
            'EMailAddress': this.email,
            'Address': {
                "AddressLine": this.address_line,
                "City": this.city,
                "StateProvinceCode": this.state,
                "PostalCode": this.zip,
                "CountryCode": this.country_code
            }
        };
    }
}

function VerifyAddress(address, callback) {

    //var apiurl = "https://wwwcie.ups.com/rest/XAV";
    var apiurl = 'https://onlinetools.ups.com/rest/XAV';

    var postdata = {
        "UPSSecurity": UPSSecurity,
        "XAVRequest": {
            "Request": {
                "RequestOption": "1",
            },
            "MaximumListSize": "10",
            "AddressKeyFormat": {}
        }
    }
    if (address instanceof Address) // Is the address the custom address class...
    {
        postdata['XAVRequest']['AddressKeyFormat'] = {
            "AddressLine": address.address_line,
            "PoliticalDivision2": address.city,
            "PoliticalDivision1": address.state,
            "PostcodePrimaryLow": address.zip,
            // "PostcodeExtendedLow": address.zip_extension,
            "CountryCode": address.country_code
        };
    } else // Or is it a preset lab address?
    {
        address = address['Address'];
        postdata['XAVRequest']['AddressKeyFormat'] = {
            "AddressLine": address['AddressLine'],
            "PoliticalDivision2": address['City'],
            "PoliticalDivision1": address['StateProvinceCode'],
            "PostcodePrimaryLow": address['PostalCode'],
            "CountryCode": address['CountryCode']
        };
    }
    var xhr = GM_xmlhttpRequest({
        method: 'POST',
        url: apiurl,
        data: JSON.stringify(postdata),
        onload: (res) => {
            callback(JSON.parse(res.responseText));
        }
    });
}

function Rate(shipTo, shipFrom, isReturn, callback) {
    //var apiurl = "https://wwwcie.ups.com/rest/Rate";
    var apiurl = 'https://onlinetools.ups.com/rest/Rate';
    if (shipTo instanceof Address) {
        shipTo = shipTo.ToXml();
    }
    if (shipFrom instanceof Address) {
        shipFrom = shipFrom.ToXml();
    }
    var postdata = {
        "UPSSecurity": UPSSecurity,
        "RateRequest": {
            "Request": {
                "RequestOption": "Shop"
            },
            "Shipment": {
                // "Shipper":shipTo,
                /*"ShipTo":
                {
                    "Address":
                    {
                        "AddressLine":shipTo.address_line,
                        "City":shipTo.city,
                        "StateProvinceCode":shipTo.state,
                        "PostalCode":shipTo.zip,
                        "CountryCode":shipTo.country_code
                    }
                },
                "ShipFrom":
                {
                    "Address":
                    {
                        "AddressLine":shipFrom.address_line,
                        "City":shipFrom.city,
                        "StateProvinceCode":shipFrom.state,
                        "PostalCode":shipFrom.zip,
                        "CountryCode":shipFrom.country_code
                    }
                },*/
                "Package": Package,
                'ShipmentRatingOptions': {
                    "NegotiatedRatesIndicator": ""
                },
                "ShipmentServiceOptions": {}
            }
        }
    }

    postdata['RateRequest']['Shipment']['ShipTo'] = shipTo;
    postdata['RateRequest']['Shipment']['ShipFrom'] = shipFrom;
    if (isReturn == true) {
        postdata['RateRequest']['Shipment']['Shipper'] = shipTo;
        postdata['RateRequest']['Shipment']['ShipmentServiceOptions'] = {
            "ReturnService": {
                "Code": "8"
            }
        }
    } else {
        postdata['RateRequest']['Shipment']['Shipper'] = shipFrom;
    }
    var xhr = GM_xmlhttpRequest({
        method: 'POST',
        url: apiurl,
        data: JSON.stringify(postdata),
        onload: (res) => {
            callback(JSON.parse(res.responseText));
        }
    });
}

function ConfirmLabel(shipFrom, shipTo, serviceCode, isReturn, callback) {
    if (shipTo instanceof Address) {
        shipTo = shipTo.ToXml();
    }
    if (shipFrom instanceof Address) {
        shipFrom = shipFrom.ToXml();
    }
    shipRequest = {
        "UPSSecurity": UPSSecurity,
        "ShipmentRequest": {
            "Request": {
                "RequestOption": "validate",
            },
            "Shipment": {
                /*"ReturnService":
                 {
                     //"Code":"8" // Electronic Return Label
                 },*/

                "PaymentInformation": {
                    "ShipmentCharge": {
                        "Type": "01",
                        "BillShipper": {
                            "AccountNumber": GM_getValue('ups_account_number')
                        }
                    }
                },
                "Service": {
                    "Code": serviceCode,
                },
                "ShipmentRatingOptions": {
                    "NegotiatedRatesIndicator": "",
                    "RateChartIndicator": "",
                },
                "ShipmentServiceOptions": {},
                "Package": Package
            },
        }
    }
    shipRequest['ShipmentRequest']['Shipment']['ShipTo'] = shipTo;
    shipRequest['ShipmentRequest']['Shipment']['ShipFrom'] = shipFrom;
    if (isReturn == true) {
        shipRequest['ShipmentRequest']['Shipment']['ShipmentServiceOptions'] = {
            "LabelDelivery": {
                "EMail": {
                    "EMailAddress": shipFrom['EMailAddress'],
                    'UndeliverableEMailAddress': 'csrs@datarecovery.com',
                    "FromEMailAddress": "csrs@datarecovery.com"
                }
            }
        };
        shipRequest['ShipmentRequest']['Shipment']['Shipper'] = shipTo;
        shipRequest['ShipmentRequest']['Shipment']['ReturnService'] = {
            "Code": "8"
        }

    } else {
        shipRequest['ShipmentRequest']['Shipment']['Shipper'] = shipFrom;
        shipRequest['ShipmentRequest']['LabelSpecification'] = {
            'LabelImageFormat': {
                'Code': 'ZPL'
            },
            'LabelStockSize': {
                'Height': '6',
                'Width': '4'
            }
        }
    }
    //var apiurl = "https://wwwcie.ups.com/rest/Ship";
    var apiurl = 'https://onlinetools.ups.com/rest/Ship';
    var xhr = GM_xmlhttpRequest({
        method: 'POST',
        url: apiurl,
        data: JSON.stringify(shipRequest),
        onload: (res) => {
            callback(JSON.parse(res.responseText));
        }
    });
}