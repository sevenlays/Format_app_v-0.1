export const fetchExchangeRates = async (countryState) => {
  if (countryState === 'Unian') {
    try {
      const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
      const data = await response.json();
  
      const usdRate = data.find(currency => currency.cc === 'USD');
      const eurRate = data.find(currency => currency.cc === 'EUR');
  
      const today = new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
      const [month, day, year] = today.split('/');
      const formattedDate = `${day}.${month}.${year}`;
  
      const result = `Официальный курс валют НБУ на ${formattedDate}\n1 USD – ${usdRate.rate.toFixed(3)} грн.\n1 EUR – ${eurRate.rate.toFixed(3)} грн.`;
  
      navigator.clipboard.writeText(result);
  
      return result;
    } catch (error) {
      console.error('Ошибка при получении курсов валют:', error);
    }
  }
};