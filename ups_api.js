// Common api dictionaries
pleasanton = {
    "Name" : "Shipping Department",
    "Phone":{
        "Number":"8002374200"
    },
    "ShipperNumber":GM_getValue('ups_account_number'),
    "Address":{
        "AddressLine":"1241 Quarry Lane Suite 115",
        "City":"Pleasanton",
        "StateProvinceCode":"CA",
        "PostalCode":"94566",
        "CountryCode":"US"
    }
};
tempe = {
    "Name" : "Shipping Department",
    "Phone":{
        "Number":"8002374200"
    },
    "ShipperNumber":GM_getValue('ups_account_number'),
    "Address":{
        "AddressLine":"1500 N Priest Drive Suite 122",
        "City":"Tempe",
        "StateProvinceCode":"AZ",
        "PostalCode":"85281",
        "CountryCode":"US"
    }
};
edwardsville = {
    "Name" : "Shipping Department",
    "Phone":{
        "Number":"8002374200"
    },
    "ShipperNumber":GM_getValue('ups_account_number'),
    "Address":{
        "AddressLine":"110 North Research Drive",
        "City":"Edwardsville",
        "StateProvinceCode":"IL",
        "PostalCode":"62025",
        "CountryCode":"US"
    }
};

service_codes = {
    '03':'UPS Ground',
    '01':'UPS Next Day Air',
    '02':'UPS 2nd Day Air',
    '59':'UPS 2nd Day Air A.M.',
    '12':'UPS 3 Day Select',
    '14':'UPS Next Day Air Early',
    '13':'UPS Next Day Air Saver'
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
    "Description":"Hard drive",
    'ReferenceNumber':
    {
        'Value':case_id
    },
    "PackagingType":
    {
        "Code":"02",
        "Description":"Customer Supplied"
    },
    "Packaging":
    {
        "Code":"02",
        "Description":"Customer Supplied"
    },
    "Dimensions":
    {
        "UnitOfMeasurement" :
        {
            "Code":"IN",
            "Description":"Inches"
        },
        "Length":"10",
        "Width":"7",
        "Height":"5"
    },
    "PackageWeight":
    {
        "UnitOfMeasurement" :
        {
            "Code":"LBS",
            "Description":"Pounds"
        },
        "Weight":"3"
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
        return JSON.stringify({
            "UPSSecurity": UPSSecurity,
            "XAVRequest": {
                "Request": {
                    "RequestOption": "1",
                },
                "MaximumListSize": "10",
                "AddressKeyFormat": {
                    "ConsigneeName": this.name,
                    "BuildingName": this.attn,
                    "AddressLine": this.address_line,
                    "PoliticalDivision2": this.city,
                    "PoliticalDivision1": this.state,
                    "PostcodePrimaryLow": this.zip,
                    "PostcodeExtendedLow": this.zip_extension,
                    "CountryCode": this.country_code
                }
            }

        });
    }
}

function VerifyAddress(address, callback) {
    var apiurl = "https://wwwcie.ups.com/rest/XAV";
    //var apiurl = 'https://onlinetools.ups.com/rest/XAV';

    var postdata = address.ToXml();
    var xhr = new GM_xmlhttpRequest({
        method:'POST',
        url:apiurl,
        data:postdata,
        onload: (res) => {
            callback(JSON.parse(res.responseText));
        }
    });
}
function Rate(shipFrom, shipTo, callback) {
    //var apiurl = "https://wwwcie.ups.com/rest/Rate";
    var apiurl = 'https://onlinetools.ups.com/rest/Rate';

    
    switch(shipTo)
    {
        case "pleasanton":
            shipTo = pleasanton;
            break;
        case "tempe":
            shipTo = tempe;
            break;
        case "edwardsville":
            shipTo = edwardsville;
            break;
    }

    var postdata = {
        "UPSSecurity": UPSSecurity,
        "RateRequest":
        {
            "Request":
            {
                "RequestOption":"Shop"
            },
            "Shipment":
            {
                "Shipper":shipTo,
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
                },
                "ShipTo": shipTo,
                "Package": Package,
                'ShipmentRatingOptions':
                {
                    "NegotiatedRatesIndicator":""
                },
                "ShipmentServiceOptions":
                {
                    "ReturnService":
                    {
                        "Code":"8"
                    }
                }
            }
        }
    }
    
    var xhr = new GM_xmlhttpRequest({
        method:'POST',
        url:apiurl,
        data:JSON.stringify(postdata),
        onload: (res) => {
            callback(JSON.parse(res.responseText));
        }
    });
}



function ReturnLabel(addr, returnTo, serviceCode, callback)
{
    var returnToAddr;
    switch(returnTo)
    {
        case "pleasanton":
            returnToAddr = pleasanton;
            break;
        case "tempe":
            returnToAddr = tempe;
            break;
        case "edwardsville":
            returnToAddr = edwardsville;
            break;
    }
    shipRequest = 
    {
        "UPSSecurity": UPSSecurity,
        "ShipmentRequest":
        {
            "Request":{
                "RequestOption":"validate",
            },
            "Shipment":
            {
                "ReturnService":
                {
                    "Code":"8" // Electronic Return Label
                },
                "Shipper": returnToAddr,
                
                "ShipTo": returnToAddr,
                "ShipFrom":
                {
                    "Name" : addr.name,
                    "Address":
                    {
                        "AddressLine": addr.address_line,
                        "City": addr.city,
                        "StateProvinceCode": addr.state,
                        "PostalCode": addr.zip,
                        "CountryCode":"US"
                    }
                },
                "PaymentInformation": 
                { 
                    "ShipmentCharge": 
                        { 
                        "Type": "01", 
                        "BillShipper": 
                        { 
                            "AccountNumber": GM_getValue('ups_account_number')
                        }
                    }
                },
                "Service":
                {
                    "Code": serviceCode,
                },
                "ShipmentRatingOptions":
                {
                    "NegotiatedRatesIndicator" : "",
                    "RateChartIndicator":"",
                },
                "ShipmentServiceOptions":
                {
                    /*"Notification":
                    {
                        "NotificationCode":"2",
                        "EMail":
                        {
                            "EMailAddress": addr.email // Not the actual label, just a notification that it was sent. Maybe send to case manager?
                        }
                    },*/
                    "LabelDelivery":
                    {
                        "EMail":
                        {
                            "EMailAddress": addr.email,
                            'UndeliverableEMailAddress':'csrs@datarecovery.com',
                            "FromEMailAddress":"csrs@datarecovery.com"
                        }
                    }
                },
                "Package":Package
            },
        }
    }
    var apiurl = "https://wwwcie.ups.com/rest/Ship";
    //var apiurl = 'https://onlinetools.ups.com/rest/Ship';
    var xhr = new GM_xmlhttpRequest({
        method:'POST',
        url:apiurl,
        data:JSON.stringify(shipRequest),
        onload: (res) => {
            callback(JSON.parse(res.responseText));
        }
    });
}