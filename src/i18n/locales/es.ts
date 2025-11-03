export const es = {
  common: {
    send: "Enviar",
    receive: "Recibir",
    swap: "Intercambiar",
    back: "Atrás",
    close: "Cerrar",
    done: "Hecho",
    continue: "Continuar",
    cancel: "Cancelar",
    copy: "Copiar",
    copied: "¡Copiado!",
    settings: "Configuración",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    failed: "Fallido",
    tryAgain: "Intentar de nuevo",
    max: "MÁX"
  },
  wallet: {
    title: "Cartera Gorbag",
    dashboard: "Panel",
    activity: "Actividad",
    tokens: "Tokens",
    manageTokens: "Gestionar tokens",
    yourTokens: "Tus tokens",
    portfolioValue: "Valor del portafolio",
    totalBalance: "Saldo total",
    todayChange: "+{{change}}% hoy",
    sendTokens: "Enviar tokens",
    receiveTokens: "Recibir tokens",
    hideTokens: "Ocultar tokens",
    network: "Red",
    networkSolana: "Red Solana",
    networkGorbagana: "Red Gorbagana"
  },
  send: {
    title: "Enviar tokens",
    recipientAddress: "Dirección del destinatario",
    enterAddress: "Ingresar dirección de cartera",
    amount: "Monto",
    networkFee: "Tarifa de red",
    total: "Total",
    twentyPercent: "20%",
    fiftyPercent: "50%",
    balance: "Disponible: {{balance}} {{symbol}}",
    invalidAddress: "Dirección de destinatario inválida",
    insufficientBalance: "Saldo insuficiente",
    insufficientFees: "Saldo insuficiente de {{symbol}} para comisiones de transacción. Mínimo {{min}} {{symbol}} requerido.",
    transactionConfirmed: "¡Transacción confirmada!",
    tokensSent: "Tus tokens han sido enviados",
    transactionFailed: "Transacción fallida",
    somethingWentWrong: "Algo salió mal",
    signAndConfirm: "Firmar y confirmar transacción",
    simulation: "Simulando transacción",
    checkingViability: "Verificando viabilidad de la transacción...",
    simulated: "Transacción simulada",
    simulationSuccess: "Simulación exitosa",
    from: "Enviando {{amount}} {{symbol}} a {{address}}",
    confirming: "Confirmando transacción",
    pleaseConfirm: "Por favor, confirme en la billetera..."
  },
  receive: {
    title: "Recibir tokens",
    generatingQR: "Generando QR...",
    yourAddress: "Tu dirección",
    copyAddress: "Copiar dirección"
  },
  swap: {
    title: "Intercambiar tokens",
    from: "De",
    to: "A",
    slippage: "Tolerancia de deslizamiento",
    priorityFee: "Tarifa prioritaria",
    rate: "Tasa",
    networkFee: "Tarifa de red",
    twentyFivePercent: "25%",
    slippageTolerance: "Tolerancia de deslizamiento: {{slippage}}%",
    swappingNotAvailable: "Intercambio no disponible",
    networkNotice: "Aviso de red",
    swapNetworkNotice: "El intercambio aún no está disponible en la red Gorbagana. Por favor cambie a la red Solana para usar las funciones de intercambio.",
    swapButton: "Intercambiar"
  },
  activity: {
    title: "Actividad reciente",
    loading: "Cargando historial de transacciones...",
    error: "No se pudo cargar el historial de transacciones. Por favor, inténtelo de nuevo.",
    all: "Todo",
    sent: "Enviado",
    received: "Recibido",
    noHistory: "No se encontró historial de transacciones",
    unknown: "Desconocido",
    amount: "{{sign}}{{amount}}",
    transactionHash: "Hash de transacción"
  },
  settings: {
    title: "Configuración",
    preferences: "Preferencias",
    activeNetworks: "Redes activas",
    general: "General",
    language: "Idioma",
    security: "Seguridad",
    about: "Acerca de",
    version: "Versión",
    theme: "Tema",
    currency: "Moneda",
    currencies: {
      usd: "USD - Dólar estadounidense",
      gbp: "GBP - Libra esterlina",
      ngn: "NGN - Naira nigeriana",
      eur: "EUR - Euro",
      jpy: "JPY - Yen japonés"
    },
    security: {
      title: "Seguridad",
      walletPassword: "Contraseña de la cartera",
      passwordSet: "Establecer",
      changePassword: "Cambiar contraseña",
      setPassword: "Establecer contraseña",
      enterPassword: "Ingresar contraseña",
      confirmPassword: "Confirmar contraseña",
      passwordsDoNotMatch: "Las contraseñas no coinciden",
      passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
      cancel: "Cancelar",
      save: "Guardar",
      autoLockTimer: "Temporizador de bloqueo automático",
      immediately: "Inmediatamente",
      minutes: "{{count}} minutos",
      hour: "{{count}} hora",
      hours: "{{count}} horas"
    }
  },
  errors: {
    invalidAddress: "Dirección de cartera inválida",
    insufficientFunds: "Fondos insuficientes",
    transactionFailed: "Transacción fallida",
    networkError: "Error de red",
    unknownError: "Ocurrió un error desconocido"
  },
  languages: {
    en: "Inglés",
    da: "Danés",
    fr: "Francés",
    es: "Español"
  },
  onboarding: {
    importKey: {
      back: "Atrás",
      title: "Ingrese su frase semilla",
      description: "Ingrese su frase semilla de 12 palabras o su clave privada codificada en Base58.",
      label: "Frase semilla o clave privada",
      placeholder: "Ingrese su frase semilla de 12 palabras o clave privada Base58",
      importWallet: "Importar billetera"
    },
    importNickname: {
      back: "Atrás",
      title: "Importar billetera",
      description: "Dale un nombre a tu billetera importada",
      label: "Apodo de la billetera",
      placeholder: "p.ej., Mi billetera importada",
      continue: "Continuar"
    },
    nickname: {
      back: "Atrás",
      title: "Nombra tu billetera",
      description: "Dale a tu billetera un nombre memorable",
      label: "Apodo de la billetera",
      placeholder: "p.ej., Mi billetera principal",
      continue: "Continuar"
    },
    seedPhrase: {
      back: "Atrás",
      title: "Tu frase semilla",
      description: "Guarda esta frase en un lugar seguro. Nunca la compartas con nadie. La necesitarás para recuperar tu billetera.",
      reveal: "Haz clic para revelar",
      copied: "Copiado",
      copyPhrase: "Copiar frase",
      download: "Descargar como archivo",
      saved: "He guardado mi frase"
    },
    setupLoading: {
      title: "Configurando tu billetera",
      description: "Por favor espera mientras aseguramos tu billetera..."
    },
    verifySeed: {
      back: "Atrás",
      title: "Verifica tu frase semilla",
      description: "Ingresa las palabras en las posiciones que se muestran a continuación",
      word: "Palabra #{{index}}",
      placeholder: "Ingresa la palabra #{{index}}",
      verify: "Verificar frase"
    },
    nft: {
      title: "NFTs",
      comingSoon: "Próximamente",
      description: "El soporte para NFT llegará a Gorbag Wallet"
    }
  }
};