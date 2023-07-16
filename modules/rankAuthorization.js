const Rank = Object.freeze({
    Director: Symbol("director"),
    AssistantManager: Symbol("assistant_manager"),
    DepartementManager: Symbol("departement_manager"),
    Specialist: Symbol("specialist"),
    Incumbent: Symbol("incumbent"),
    Resident: Symbol("resident"),
    Intern: Symbol("intern")
});

module.exports = {
    Rank: Rank,
    hasAuthorization: function(minRank, memberRoleCache) {
        let hasAuthorization = false;

        switch (minRank) {
            case Rank.Intern:
                hasAuthorization = hasAuthorization || memberRoleCache.has(process.env.IRIS_INTERN_ROLE);
            case Rank.Resident:
                hasAuthorization = hasAuthorization || memberRoleCache.has(process.env.IRIS_RESIDENT_ROLE);
            case Rank.Incumbent:
                hasAuthorization = hasAuthorization || memberRoleCache.has(process.env.IRIS_INCUMBENT_ROLE);
            case Rank.Specialist:
                hasAuthorization = hasAuthorization || memberRoleCache.has(process.env.IRIS_SPECIALIST_ROLE);
            case Rank.DepartementManager:
                hasAuthorization = hasAuthorization || memberRoleCache.has(process.env.IRIS_DEPARTEMENT_MANAGER_ROLE);
            case Rank.AssistantManager:
                hasAuthorization = hasAuthorization || memberRoleCache.has(process.env.IRIS_ASSISTANT_MANAGER_ROLE);
            case Rank.Director:
                hasAuthorization = hasAuthorization || memberRoleCache.has(process.env.IRIS_DIRECTOR_ROLE);
                break;
            default:
                hasAuthorization = false;
                break;
        }

        return hasAuthorization;
    }
};
