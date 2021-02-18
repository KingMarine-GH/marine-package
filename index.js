const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const List = require("collections/list");

function lookup(groupName, idNumber) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "lookup_json", `${groupName}.json`)));

    if (data[idNumber]) {
        return data[idNumber].Name;
    } else {
        // TODO: Make sure code using the function can handle null
        return null;
    }
}

class coreId {
    constructor(name, tag, id) {
        this.name = name;
        this.tag = tag;
        this.userId = id;
    }
}

class governmentDocument {
    /**
     * @param {string} department Issuing Department
     * @param {string} name Name of Document
     * @param {string} index Number of Document
     * @param {URL} link URL of link
     */
    constructor(department, name, index, link) {
        this.department = department;
        this.name = name;
        this.index = index;
        this.link = link;
    }

    correctName(newName) {
        this.name = newName;
    }
}

class voteData {
    constructor(voter, votes) {
        this.voterInfo.status = "Valid";
        this.voterInfo.voter = voter;
        this.voterInfo.casted = Date.now();

        this.votes.data = votes;
        this.votes.count = -1; // since arrays are from 0-n, -1 is the new 0 B)
    }

    countVote() {
        if (this.votes.data.length > this.votes.count) {
            this.votes.count++;

            const nextVote = this.votes.data[this.votes.count];

            return nextVote;
        } else {
            return "No Candidate";
        }
    }

    invalidateVote(reason) {
        this.voterInfo.status = "Invalid";
        this.voterInfo.reason = reason;
    }
}

// TODO: Ask Fed if I should consider everyone as a Federalist
class FederalistId extends coreId {
    constructor(name, tag, id) {
        super(name, tag, id);
    }
}

class OutsiderId extends coreId {
    constructor(name, tag, id) {
        super(name, tag, id);
    }
}

class ArrestInfo {

}

class Award {
    constructor(issuer, awardIdNumber, award) {
        this.name = lookup("award", awardIdNumber);
        this.issued = Date.now();
        this.award = award;
        this.issuer = issuer;
        // TODO: accept image links for visual of medal or whatever
    }

    overwriteIssue(newDate) {
        this.issued = newDate; // overwrite issue should be in unix
    }
}

class GovDocument extends governmentDocument {

}

class LegislationAction {
    constructor(userid, action) {
        this.userid = userid;
        this.action = action;
        this.timestamp = Date.now();
    }
}

class Bill extends governmentDocument {
    constructor(name, index, link, sponsorid) {
        // TODO: Find a way to get next index (see submit command in bot)
        // CONSIDER: having the input already have the index
        super("Congress", name, index, link);
        this.sponsors = new List([sponsorid]);
        this.status = "Submitted";
        this.actions = [];

    }

    cosponsor(userid) {
        this.sponsors.push(userid);
        this.actions.push(new LegislationAction(userid, "Cosponsor"))
    }

    /**
     * This should be on a Try...Catch since this function throws errors
     * @param {String} userid 
     */
    uncosponsor(userid) {
        if (this.sponsors.has(userid)) {
            this.sponsors.delete(userid);
        } else {
            throw new TypeError(`${userid} is not a cosponsor of bill ${this.index}.`);
        }
    }
}

class Amendment extends governmentDocument {
    constructor(name, index, link) {
        super("Congress", name, index, link);
    }
}

class Law {
    /**
     * Insert a new law to the Federalist Record
     * @param {String} name Name of the Law
     * @param {URL} link URL of the Law
     * @param {Bill} BillObject
     * @param {Date} enacted Optional. Date enacted. Date autofills to current date if empty.
     * @param {String} status Optional. If law is In Effect, Repealed, or Declared Unconstitutional or whatever. Status autofills to "Enacted" if empty.
     * // TODO: Consider crossing Law with Bill in the add command
     */

    constructor(name, link, enacted = Date.now(), BillObject, status = "In Effect") {
        this.name = name;
        this.link = link;
        this.enacted = enacted;
        this.sponsors = BillObject.sponsors;
        this.billnumber = BillObject.index;
        this.status = status;
    }

    /**
     * Change status of the law
     * @param {String} newstatus
     */
    changeStatus(newstatus) {
        this.stauts = newstatus;
    }
}

module.exports = {
    vote: voteData,
    FedId: FederalistId,
    OutsiderId: OutsiderId,
    Arrest: ArrestInfo,
    Award: Award,
    GovDocument: GovDocument,
    Bill: Bill,
    Amendment: Amendment,
    Law: Law,
};