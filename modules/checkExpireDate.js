module.exports = {
    check: (dateToCheck) => {
        dateToCheck = dateToCheck.split('/');
        let dayToCheck = parseInt(dateToCheck[0]);
        let monthToCheck = parseInt(dateToCheck[1]);
        currentDate = new Date();
        if(monthToCheck == (currentDate.getMonth() + 1)) {
            if(dayToCheck < currentDate.getDate()) {
                return 'Expired';
            } else {
                return 'Good';
            }
        } else if(monthToCheck < (currentDate.getMonth() + 1)) {
            return 'Expired';
        } else {
            return 'Good';
        }
    }
}