/** @format */

const { userModel } = require("../model/userModel");

exports.createUser = async (req, res) => {
  try {
    console.log("entry");
    //console.log(req.body);
    // const { username, email } = req.body;
    const newUser = new userModel(req.body);
    console.log(newUser);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

module.exports.postVendorBill = async (req) => {
  try {
    const { vendorBillModel, journalEntryModel } = conn.account(req.decode.db);
    const { taxModel } = conn.settings(req.decode.db);
    const { glconfigModel } = conn.purchase(req.decode.db);
    if (req.body.id) {
      let vendorBillExist = await vendorBillModel.findOne({
        _id: req.body.id,
      });
      if (!vendorBillExist) {
        return (res = {
          data: "not found",
          status: STATUSCODES.BADREQUEST,
        });
      }
      // create journel entry for received quantity
      let journelEntries = [];
      let glconfigExist = await glconfigModel.findOne({});

      if (vendorBillExist) {
        if (glconfigExist) {
          for (let i = 0; i < vendorBillExist.itemInfo.length; i++) {
            const element = vendorBillExist.itemInfo[i];

            let debitJournelObj = {
              account: element.chartOfAccountId
                ? element.chartOfAccountId
                : null,
              partner: vendorBillExist.vendorId,
              employee: element.employeeId ? element.employeeId : null,
              branch: vendorBillExist.branchId
                ? vendorBillExist.branchId
                : null,
              debit: element.itemTotal - element.discount,
              credit: 0,
            };
            journelEntries.push(debitJournelObj);

            if (Array.isArray(element.tax) && element.tax.length > 0) {
              for (let j = 0; j < element.tax.length; j++) {
                const eachTax = element.tax[j];
                let taxAcoount = await taxModel.findOne({ _id: eachTax.taxId });
                let TaxdebitJournelObj = {
                  account: taxAcoount.taxAccount ? taxAcoount.taxAccount : null,
                  partner: vendorBillExist.vendorId,
                  employee: null,
                  branch: vendorBillExist.branchId
                    ? vendorBillExist.branchId
                    : null,
                  debit: eachTax.amount ? eachTax.amount : null,
                  credit: 0,
                };
                journelEntries.push(TaxdebitJournelObj);
              }
            }
          }

          let creditJournelObj = {
            account: glconfigExist.accounts.defaultPayable
              ? glconfigExist.accounts.defaultPayable
              : null,
            partner: vendorBillExist.vendorId,
            employee: null,
            branch: vendorBillExist.branchId ? vendorBillExist.branchId : null,
            debit: 0,
            credit: vendorBillExist.total ? vendorBillExist.total : null,
          };
          journelEntries.push(creditJournelObj);
          console.log(journelEntries);
          let newJournal = new journalEntryModel({
            reference: vendorBillExist.name ? vendorBillExist.name : null,
            referanceId: vendorBillExist._id,
            accountingDate: vendorBillExist.accountingDate,
            journal: vendorBillExist.journelId,
            journalList: journelEntries,
            status: JOURNALSTATUS.COM,
          });
          let journalEntryList = await journalEntryModel.aggregate([
            {
              $sort: { name: -1 },
            },
          ]);
          if (journalEntryList.length > 0) {
            newJournal.name = journalEntryList[0].name + 1;
          } else {
            newJournal.name = 1;
          }
          newJournal.month = new Date().getMonth() + 1;
          newJournal.year = new Date().getFullYear();
          let journelEntryData = await newJournal.save();
          if (!journelEntryData) {
            return (res = {
              data: "JOURNEL ENTRY SAVE FAILED",
              status: STATUSCODES.ERROR,
            });
          } else {
            vendorBillExist.status = VENDORBILLSTAT.COMPLETED;
            let updatedData = await vendorBillExist.save();
            if (updatedData) {
              return (res = {
                data: updatedData,
                status: STATUSCODES.SUCCESS,
              });
            } else {
              return (res = {
                data: "vendor payment update failed",
                status: STATUSCODES.ERROR,
              });
            }
          }
        } else {
          return (res = {
            data: "gl configuration not found",
            status: STATUSCODES.NOTFOUND,
          });
        }
      }
    } else {
      return (res = {
        data: "missing branchId , paymentType",
        status: STATUSCODES.BADREQUEST,
      });
    }
  } catch (e) {
    console.error(e);
    return (res = { data: ERRORMSG.INTSERERR, status: STATUSCODES.ERROR });
  }
};

exports.createUserArray = async (req, res) => {
  try {
    req.body.map(async (eachUser) => {
      let newUser = new userModel({
        userName: eachUser.userName,
        email: eachUser.email,
        mobileNo: eachUser.mobileNo,
        passWord: eachUser.passWord,
      });
      // console.log(newUser);
      let data = await newUser.save();
      console.log(data);
      console.log("fir");
    });

    res.status(201).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};
exports.testArray = async (req, res) => {
  try {
    let data = [];
    let arrayData = [
      {
        name: "Sarang",
        phone: 123456789,
        pin: 673345,
        referedPerson: [{ name: "Athul", phone: 12345323329, pin: 673346 }],
      },
      {
        name: "Alice",
        phone: 987654321,
        pin: 111222,
        referedPerson: [{ name: "Bob", phone: 555555555, pin: 333444 }],
      },
      {
        name: "Eve",
        phone: 333333333,
        pin: 777888,
        referedPerson: [{ name: "Charlie", phone: 777777777, pin: 222333 }],
      },
      {
        name: "David",
        phone: 444444444,
        pin: 999000,
        referedPerson: [{ name: "Emily", phone: 888888888, pin: 444555 }],
      },
      {
        name: "Frank",
        phone: 555555555,
        pin: 123123,
        referedPerson: [{ name: "Grace", phone: 999999999, pin: 777888 }],
      },
      {
        name: "Hannah",
        phone: 666666666,
        pin: 456789,
        referedPerson: [{ name: "Isaac", phone: 111111111, pin: 111222 }],
      },
      {
        name: "Julia",
        phone: 777777777,
        pin: 987654,
        referedPerson: [{ name: "Kevin", phone: 222222222, pin: 222333 }],
      },
      {
        name: "Liam",
        phone: 888888888,
        pin: 345678,
        referedPerson: [{ name: "Mia", phone: 333333333, pin: 333444 }],
      },
      {
        name: "Olivia",
        phone: 999999999,
        pin: 567890,
        referedPerson: [{ name: "Noah", phone: 444444444, pin: 444555 }],
      },
      {
        name: "Sophia",
        phone: 1010101010,
        pin: 987123,
        referedPerson: [{ name: "William", phone: 555555555, pin: 555666 }],
      },
    ];
    arrayData.forEach((eachUser) => {
      data.push({
        name: eachUser.name,
        phone: eachUser.phone,
        pin: eachUser.pin,
      });
      eachUser.referedPerson.forEach((eachReferance) => {
        data.push({
          name: eachReferance.name,
          phone: eachReferance.phone,
          pin: eachReferance.pin,
        });
      });
    });

    res.status(201).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};
