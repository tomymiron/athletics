export const formatDate = (dateString) => {
    const d = new Date(dateString);
    d.setHours(d.getHours() - 3);
    return d.toLocaleString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false}).replace(",", "");
};
