const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Kindly Smart Contract", function () {
  let kindly;
  let owner, requester, volunteer1, volunteer2, otherUser;

  beforeEach(async function () {
    [owner, requester, volunteer1, volunteer2, otherUser] = await ethers.getSigners();
    const Kindly = await ethers.getContractFactory("Kindly");
    kindly = await Kindly.deploy();
    await kindly.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should initialize with zero requests and zero completed requests", async function () {
      expect(await kindly.getTotalRequests()).to.equal(0);
      expect(await kindly.getCompletedRequestsCount()).to.equal(0);
      const allRequests = await kindly.getAllRequests();
      expect(allRequests.length).to.equal(0);
    });
  });

  describe("Request Creation", function () {
    it("should allow a user to create a help request and emit RequestCreated", async function () {
      const title = "Need help setting up Linux server";
      const desc = "Looking for someone to walk me through configuring Nginx on Ubuntu.";
      const category = "Technology";

      await expect(
        kindly.connect(requester).createRequest(title, desc, category)
      )
        .to.emit(kindly, "RequestCreated")
        .withArgs(1, requester.address, title, category, (ts) => ts > 0);

      expect(await kindly.getTotalRequests()).to.equal(1);

      const req = await kindly.getRequest(1);
      expect(req.id).to.equal(1);
      expect(req.requester).to.equal(requester.address);
      expect(req.title).to.equal(title);
      expect(req.description).to.equal(desc);
      expect(req.category).to.equal(category);
      expect(req.volunteer).to.equal(ethers.ZeroAddress);
      expect(req.status).to.equal(0); // Status.Open
    });

    it("should reject creation with empty title, description, or category", async function () {
      await expect(
        kindly.connect(requester).createRequest("", "Some desc", "Community")
      ).to.be.revertedWithCustomError(kindly, "InvalidInput");

      await expect(
        kindly.connect(requester).createRequest("Valid title", "", "Community")
      ).to.be.revertedWithCustomError(kindly, "InvalidInput");

      await expect(
        kindly.connect(requester).createRequest("Valid title", "Some desc", "")
      ).to.be.revertedWithCustomError(kindly, "InvalidInput");
    });
  });

  describe("Volunteer Assignment", function () {
    beforeEach(async function () {
      await kindly.connect(requester).createRequest(
        "Grocery delivery assistance",
        "Need help picking up groceries from the local store.",
        "Personal Assistance"
      );
    });

    it("should allow a community member to volunteer for an open request", async function () {
      await expect(kindly.connect(volunteer1).volunteer(1))
        .to.emit(kindly, "VolunteerAssigned")
        .withArgs(1, volunteer1.address, (ts) => ts > 0);

      const req = await kindly.getRequest(1);
      expect(req.volunteer).to.equal(volunteer1.address);
      expect(req.status).to.equal(1); // Status.InProgress
    });

    it("should prevent requester from volunteering for their own request (Self-volunteering prevention)", async function () {
      await expect(
        kindly.connect(requester).volunteer(1)
      ).to.be.revertedWithCustomError(kindly, "CannotVolunteerForOwnRequest");
    });

    it("should prevent a second volunteer from assigning to the same request (Duplicate volunteering prevention)", async function () {
      // First volunteer assigns
      await kindly.connect(volunteer1).volunteer(1);

      // Second volunteer attempts to volunteer
      await expect(
        kindly.connect(volunteer2).volunteer(1)
      ).to.be.revertedWithCustomError(kindly, "RequestNotOpen");

      // Same volunteer attempts to volunteer again
      await expect(
        kindly.connect(volunteer1).volunteer(1)
      ).to.be.revertedWithCustomError(kindly, "RequestNotOpen");
    });

    it("should revert if volunteering for non-existent request", async function () {
      await expect(
        kindly.connect(volunteer1).volunteer(999)
      ).to.be.revertedWithCustomError(kindly, "RequestNotFound");
    });
  });

  describe("Request Completion", function () {
    beforeEach(async function () {
      await kindly.connect(requester).createRequest(
        "Logo Design feedback",
        "Would love feedback on our non-profit community logo.",
        "Design"
      );
      await kindly.connect(volunteer1).volunteer(1);
    });

    it("should allow the original requester to complete an in-progress request", async function () {
      await expect(kindly.connect(requester).completeRequest(1))
        .to.emit(kindly, "RequestCompleted")
        .withArgs(1, requester.address, volunteer1.address, (ts) => ts > 0);

      const req = await kindly.getRequest(1);
      expect(req.status).to.equal(2); // Status.Completed
      expect(await kindly.getCompletedRequestsCount()).to.equal(1);
    });

    it("should prevent unauthorized users (including volunteer) from completing the request", async function () {
      // Volunteer tries to complete
      await expect(
        kindly.connect(volunteer1).completeRequest(1)
      ).to.be.revertedWithCustomError(kindly, "NotRequester");

      // Random third party tries to complete
      await expect(
        kindly.connect(otherUser).completeRequest(1)
      ).to.be.revertedWithCustomError(kindly, "NotRequester");
    });

    it("should prevent completing a request that has no volunteer assigned", async function () {
      await kindly.connect(requester).createRequest(
        "Math tutoring",
        "Help with calculus homework.",
        "Education"
      );
      // Request 2 has no volunteer yet
      await expect(
        kindly.connect(requester).completeRequest(2)
      ).to.be.revertedWithCustomError(kindly, "CannotCompleteWithoutVolunteer");
    });

    it("should prevent completing an already completed request", async function () {
      await kindly.connect(requester).completeRequest(1);
      await expect(
        kindly.connect(requester).completeRequest(1)
      ).to.be.revertedWithCustomError(kindly, "RequestAlreadyClosed");
    });
  });

  describe("Request Cancellation", function () {
    beforeEach(async function () {
      await kindly.connect(requester).createRequest(
        "Need ride to airport",
        "Early morning flight to conference.",
        "Personal Assistance"
      );
    });

    it("should allow the requester to cancel their open request", async function () {
      await expect(kindly.connect(requester).cancelRequest(1))
        .to.emit(kindly, "RequestCancelled")
        .withArgs(1, requester.address, (ts) => ts > 0);

      const req = await kindly.getRequest(1);
      expect(req.status).to.equal(3); // Status.Cancelled
    });

    it("should prevent non-requesters from cancelling the request", async function () {
      await expect(
        kindly.connect(otherUser).cancelRequest(1)
      ).to.be.revertedWithCustomError(kindly, "NotRequester");
    });

    it("should prevent volunteering on a cancelled request", async function () {
      await kindly.connect(requester).cancelRequest(1);

      await expect(
        kindly.connect(volunteer1).volunteer(1)
      ).to.be.revertedWithCustomError(kindly, "RequestNotOpen");
    });

    it("should prevent cancelling a request once a volunteer has already taken it", async function () {
      await kindly.connect(volunteer1).volunteer(1);

      await expect(
        kindly.connect(requester).cancelRequest(1)
      ).to.be.revertedWithCustomError(kindly, "RequestNotOpen");
    });
  });

  describe("getAllRequests query", function () {
    it("should return all requests in order", async function () {
      await kindly.connect(requester).createRequest("Task 1", "Desc 1", "Education");
      await kindly.connect(requester).createRequest("Task 2", "Desc 2", "Technology");
      await kindly.connect(otherUser).createRequest("Task 3", "Desc 3", "Community");

      const all = await kindly.getAllRequests();
      expect(all.length).to.equal(3);
      expect(all[0].title).to.equal("Task 1");
      expect(all[1].title).to.equal("Task 2");
      expect(all[2].title).to.equal("Task 3");
      expect(all[2].requester).to.equal(otherUser.address);
    });
  });
});

