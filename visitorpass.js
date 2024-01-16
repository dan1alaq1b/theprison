let visitorpass;

class VisitorPass {
  static async injectDB(conn) {
    visitorpass = await conn.db('Prison_VMS').collection('visitorpass');
  }

  static async create({
    firstname,
    lastname,
    timeIn,
    timeOut,
    officerno,
    visitorRelationship
  }) {
    // TODO: Save visitor pass to database
    await visitorpass.insertOne({
      Firstname: firstname,
      Lastname: lastname,
      TimeIn: timeIn,
      TimeOut: timeOut,
      OfficeNo: officerno,
      VisitorRelationship: visitorRelationship
    });
    return { status: 'Successfully created visitor pass' };
  }

  static async retrieve({
    firstname,
    lastname
  }) {
    // TODO: Retrieve visitor pass from the database based on inmate's name
    return visitorpass.findOne({ Firstname: firstname, Lastname: lastname });
  }
}

module.exports = VisitorPass;
