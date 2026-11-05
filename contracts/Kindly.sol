// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Kindly
 * @notice Small Requests. Real Help.
 * @dev An on-chain community platform where users request small assistance tasks
 *      and community members volunteer to help.
 */
contract Kindly {
    enum RequestStatus {
        Open,
        InProgress,
        Completed,
        Cancelled
    }

    struct HelpRequest {
        uint256 id;
        address requester;
        string title;
        string description;
        string category;
        address volunteer;
        uint256 createdAt;
        RequestStatus status;
    }

    // State variables
    uint256 private _requestCount;
    uint256 private _completedCount;

    mapping(uint256 => HelpRequest) private _requests;

    // Events
    event RequestCreated(
        uint256 indexed requestId,
        address indexed requester,
        string title,
        string category,
        uint256 timestamp
    );

    event VolunteerAssigned(
        uint256 indexed requestId,
        address indexed volunteer,
        uint256 timestamp
    );

    event RequestCompleted(
        uint256 indexed requestId,
        address indexed requester,
        address indexed volunteer,
        uint256 timestamp
    );

    event RequestCancelled(
        uint256 indexed requestId,
        address indexed requester,
        uint256 timestamp
    );

    // Custom errors for gas efficiency and clarity
    error InvalidInput(string reason);
    error RequestNotFound(uint256 requestId);
    error NotRequester(address caller, address requester);
    error CannotVolunteerForOwnRequest();
    error RequestNotOpen(uint256 requestId, RequestStatus currentStatus);
    error VolunteerAlreadyAssigned(uint256 requestId, address existingVolunteer);
    error CannotCompleteWithoutVolunteer(uint256 requestId);
    error RequestAlreadyClosed(uint256 requestId, RequestStatus currentStatus);

    /**
     * @notice Create a new help request
     * @param title Brief summary of the help needed (max 100 chars)
     * @param description Detailed explanation of what assistance is requested
     * @param category Classification category (e.g. Education, Technology, etc.)
     * @return requestId The ID of the newly created request
     */
    function createRequest(
        string calldata title,
        string calldata description,
        string calldata category
    ) external returns (uint256) {
        if (bytes(title).length == 0) {
            revert InvalidInput("Title cannot be empty");
        }
        if (bytes(title).length > 120) {
            revert InvalidInput("Title is too long (max 120 chars)");
        }
        if (bytes(description).length == 0) {
            revert InvalidInput("Description cannot be empty");
        }
        if (bytes(category).length == 0) {
            revert InvalidInput("Category cannot be empty");
        }

        _requestCount++;
        uint256 newId = _requestCount;

        _requests[newId] = HelpRequest({
            id: newId,
            requester: msg.sender,
            title: title,
            description: description,
            category: category,
            volunteer: address(0),
            createdAt: block.timestamp,
            status: RequestStatus.Open
        });

        emit RequestCreated(newId, msg.sender, title, category, block.timestamp);

        return newId;
    }

    /**
     * @notice Volunteer to fulfill an open help request
     * @param requestId The ID of the request to assist with
     */
    function volunteer(uint256 requestId) external {
        if (requestId == 0 || requestId > _requestCount) {
            revert RequestNotFound(requestId);
        }

        HelpRequest storage req = _requests[requestId];

        if (req.requester == msg.sender) {
            revert CannotVolunteerForOwnRequest();
        }
        if (req.status != RequestStatus.Open) {
            revert RequestNotOpen(requestId, req.status);
        }
        if (req.volunteer != address(0)) {
            revert VolunteerAlreadyAssigned(requestId, req.volunteer);
        }

        req.volunteer = msg.sender;
        req.status = RequestStatus.InProgress;

        emit VolunteerAssigned(requestId, msg.sender, block.timestamp);
    }

    /**
     * @notice Mark a request as completed once assistance has been provided
     * @dev Only the original requester can complete the request, and only after a volunteer is assigned
     * @param requestId The ID of the request to complete
     */
    function completeRequest(uint256 requestId) external {
        if (requestId == 0 || requestId > _requestCount) {
            revert RequestNotFound(requestId);
        }

        HelpRequest storage req = _requests[requestId];

        if (req.requester != msg.sender) {
            revert NotRequester(msg.sender, req.requester);
        }
        if (req.status == RequestStatus.Completed || req.status == RequestStatus.Cancelled) {
            revert RequestAlreadyClosed(requestId, req.status);
        }
        if (req.status != RequestStatus.InProgress || req.volunteer == address(0)) {
            revert CannotCompleteWithoutVolunteer(requestId);
        }

        req.status = RequestStatus.Completed;
        _completedCount++;

        emit RequestCompleted(requestId, req.requester, req.volunteer, block.timestamp);
    }

    /**
     * @notice Cancel an open help request
     * @dev Only the requester can cancel, and only while it is Open (no volunteer assigned yet)
     * @param requestId The ID of the request to cancel
     */
    function cancelRequest(uint256 requestId) external {
        if (requestId == 0 || requestId > _requestCount) {
            revert RequestNotFound(requestId);
        }

        HelpRequest storage req = _requests[requestId];

        if (req.requester != msg.sender) {
            revert NotRequester(msg.sender, req.requester);
        }
        if (req.status != RequestStatus.Open) {
            revert RequestNotOpen(requestId, req.status);
        }

        req.status = RequestStatus.Cancelled;

        emit RequestCancelled(requestId, msg.sender, block.timestamp);
    }

    /**
     * @notice Fetch a single request by ID
     * @param requestId The ID of the request
     */
    function getRequest(uint256 requestId) external view returns (HelpRequest memory) {
        if (requestId == 0 || requestId > _requestCount) {
            revert RequestNotFound(requestId);
        }
        return _requests[requestId];
    }

    /**
     * @notice Fetch all requests stored on-chain
     * @return allReqs Array of all help requests
     */
    function getAllRequests() external view returns (HelpRequest[] memory) {
        uint256 total = _requestCount;
        HelpRequest[] memory allReqs = new HelpRequest[](total);

        for (uint256 i = 1; i <= total; i++) {
            allReqs[i - 1] = _requests[i];
        }

        return allReqs;
    }

    /**
     * @notice Get total number of requests created
     */
    function getTotalRequests() external view returns (uint256) {
        return _requestCount;
    }

    /**
     * @notice Get total number of requests successfully completed
     */
    function getCompletedRequestsCount() external view returns (uint256) {
        return _completedCount;
    }
}

