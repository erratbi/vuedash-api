import csv from "csv";
import {readFileSync} from "fs";
import moment from "moment-timezone";

moment.tz.setDefault("GMT");

const parseFile = path => {
  const raw = readFileSync(path, "latin1");
  const data = raw.split(/\r?\n/).slice(3, -3).join("\n");

  return new Promise(resolve => {
    csv.parse(data, (err, output) => {
      if (err) throw err;
      const records = output.map((line, i) => {
        const order = {
          number: line[0],
          paypal: line[34] || null,
          poster: "",
          quantity: parseInt(line[14]),
          price: parseFloat(line[15].replace("$", "")),
          size: line[39].replace(/\[Size:(\w+?)]/,"$1"),
          status: line[34].length ? "paid" : "sold",
          tracking: "",
          product: {
            number: line[11],
            title: line[12].replace(/\[\w]$/i, ""),
          },
          buyer: {
            id: line[1],
            fullName: line[2],
            phone: line[3],
            email: line[4],
            address1: line[5],
            address2: line[6],
            city: line[7],
            state: line[8],
            zip: line[9],
            country: line[10],
          }
        };

        order.sold_at = moment(line[22], "MMM-DD-YY").isValid() ? moment(line[22], "MMM-DD-YY") : "";
        order.paid_at = moment(line[24], "MMM-DD-YY").isValid() ? moment(line[24], "MMM-DD-YY") : "";
        order.shipped_at = moment(line[25], "MMM-DD-YY").isValid() ? moment(line[25], "MMM-DD-YY") : "";

        return order;
      }).filter(item => !!item);

      return resolve(records);
    });
  });
};

module.exports = parseFile;
