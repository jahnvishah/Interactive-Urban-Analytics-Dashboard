function getAgeGroupColor(age) {
    if (age >= 18 && age <= 25) {
        return "reb";
    } else if (age >= 26 && age <= 30) {
        return "blue";
    } else if (age >= 31 && age <= 40) {
        return "green";
    } else if (age >= 41 && age <= 50) {
        return "yellow";
    } else if (age >= 51 && age <= 55) {
        return "orange";
    } else if (age >= 56 && age <= 60) {
        return "pink";
    } else {
        return "black";
    }
}


export {getAgeGroupColor}