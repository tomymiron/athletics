import { Dimensions } from "react-native";

export const formatDate = (dateString) => {
    const d = new Date(dateString);
    d.setHours(d.getHours() - 3);
    return d.toLocaleString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false}).replace(",", "");
};

export function timeSince(date) {
  let aux = new Date(date);
  var seconds = Math.floor((new Date() - aux) / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + "años";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "M";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "d"
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "hs"
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "m"
  }
  return Math.abs(Math.floor(seconds)) + "s"
}

// export function timeTo(date) {
//   try{
//     let aux = new Date(date);
//     var seconds = Math.floor((aux - new Date()) / 1000);
//     var interval = seconds / 31536000;

//     if (interval > 1) {
//       return Math.floor(interval) + "años";
//     }
//     interval = seconds / 2592000;
//     if (interval > 1) {
//       return Math.floor(interval) + "M";
//     }
//     interval = seconds / 86400;
//     if (interval > 1) {
//       return Math.floor(interval) + "d"
//     }
//     interval = seconds / 3600;
//     if (interval > 1) {
//       return Math.floor(interval) + "hs"
//     }
//     interval = seconds / 60;
//     if (interval > 1) {
//       return Math.floor(interval) + "m"
//     }
//     return Math.floor(seconds) + "s"
//   }catch(err){
//     return "???"
//   }
// }

// export function dateFormatter(date) {
//   function join(date, options, separator) {
//     function format(option) {
//       let formatter = new Intl.DateTimeFormat("es", option);
//       return formatter.format(date);
//     }
//     return options.map(format).join(separator);
//   }
//   let options = [{ day: "numeric" }, { month: "numeric" }, { year: "numeric" }];
//   let dateSta = join(new Date(date), [{ weekday: "long" }], " ");
//   let dateMid = join(new Date(date), options, "/");
//   let dateEnd = date.slice(-8, -3);
//   let eventDate = dateSta.charAt(0).toUpperCase() + dateSta.slice(1) + " " + dateMid + " | " + dateEnd + "hs";
//   return eventDate;
// }

// export function dateFormatterShorter(date) {
//   try{
//     function join(date, options, separator) {
//       function format(option) {
//         let formatter = new Intl.DateTimeFormat("es", option);
//         return formatter.format(date);
//       }
//       return options.map(format).join(separator);
//     }
//     let options = [{ day: "numeric" }, { month: "numeric" }, { year: "numeric" }];
//     let dateMid = join(new Date(date), options, "/");
//     let dateEnd = date.slice(-8, -3);
//     let eventDate = dateMid + " | " + dateEnd + "hs";
//     return eventDate;
//   }catch(err){
//     return "???";
//   }
// }

// export function borndateFormatter(date) {
//   const dateSplitted = date.split("-");
//   const newDate = dateSplitted[2] + "/" + dateSplitted[1] + "/" + dateSplitted[0];
//   return newDate;
// }

// export function locationShorter(location){
//   const width = Dimensions.get("window").width
//   if(width > 390 && location.length > 25){
//     return location.slice(0, 25) + "... ";
//   }else if(location.length > 20){
//     return location.slice(0, 20) + "... ";
//   }
//   return location;
// }

// export function locationMoreShorter(location){
//   const width = Dimensions.get("window").width
//   if(width > 390 && location.length > 15){
//     return location.slice(0, 15) + "... ";
//   }else if(location.length > 12){
//     return location.slice(0, 12) + "... ";
//   }
//   return location;
// }

// export function mysqlAdapter(date){
//   const partesFecha = date.split("/");
//   return (partesFecha[2] + "-" + partesFecha[1] + "-" + partesFecha[0]);
// }