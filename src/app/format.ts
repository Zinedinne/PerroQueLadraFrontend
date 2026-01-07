export const formatManualDate = (dateString: string): string => {
  if (!dateString) return "PRÓXIMAMENTE";
  
  const date = new Date(dateString);
  const months = [
    "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", 
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"
  ];
  
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear(); 
  
  return `${day} ${month} ${year}`;
};


export const formatManualPrice = (price: number): string => {
  if (price === undefined || price === null) return "$0.00";
  
  const parts = price.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  return `$${parts.join(".")}`;
};