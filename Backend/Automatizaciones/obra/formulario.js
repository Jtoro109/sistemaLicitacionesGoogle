/**
 * EJECUTA ESTA FUNCIÓN UNA SOLA VEZ MANUALMENTE PARA CONECTAR EL FORMULARIO
 */
function instalarActivadorNuevaObra() {
  // Reemplaza esto con el ID real de tu formulario "Nueva Obra"
  const ID_FORMULARIO_NUEVA_OBRA =
    "1OVUn1vVxHRRuWGDeIH6KY3ur199NBPbChu1IDKcVJxQ";

  // 1. Borramos activadores anteriores para no duplicar si lo corres dos veces
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (
      triggers[i].getHandlerFunction() === "crearCarpetaYFormularioDesdeCero"
    ) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // 2. Creamos el nuevo activador apuntando a tu formulario
  ScriptApp.newTrigger("crearCarpetaYFormularioDesdeCero")
    .forForm(FormApp.openById(ID_FORMULARIO_NUEVA_OBRA))
    .onFormSubmit()
    .create();

  console.log(
    "✅ Activador instalado con éxito. El formulario ahora disparará la función.",
  );
}

/**
 * FUNCIÓN PRINCIPAL QUE SE EJECUTA AL ENVIAR EL FORMULARIO
 */
function crearCarpetaYFormularioDesdeCero(e) {
  try {
    // CORRECCIÓN CLAVE: Usamos e.source.getId() en lugar de FormApp.getActiveForm()
    const idFormulario = e.source.getId();
    const idCarpetaPadre = DriveApp.getFileById(idFormulario)
      .getParents()
      .next()
      .getId();

    const carpetaDestino = DriveApp.getFolderById(idCarpetaPadre);
    const respuestas = e.response.getItemResponses();
    let nombreObra = "";

    for (let i = 0; i < respuestas.length; i++) {
      if (respuestas[i].getItem().getTitle().indexOf("Nombre") > -1) {
        nombreObra = respuestas[i].getResponse();
        break;
      }
    }

    if (nombreObra) {
      // 1. Crear Carpeta de la Obra
      const nuevaCarpeta = carpetaDestino.createFolder(nombreObra);

      // ------------------------------------------------------------------
      // 2. CREAR EL FORMULARIO "NUEVA LICITACIÓN"
      // ------------------------------------------------------------------
      const nuevoForm = FormApp.create("Nueva Licitación - " + nombreObra);

      nuevoForm.setDescription(
        "Documentación requerida para participar en el proceso de licitación de la obra: " +
          nombreObra,
      );

      // Pregunta 1
      nuevoForm
        .addTextItem()
        .setTitle("OBJETO DE INVITACIÓN")
        .setRequired(true);

      // Pregunta 2
      const listaDocumentos = [
        "Carta remisoria",
        "Certificado de existencia y representación legal vigente",
        "Resumen de las obras ejecutadas y en ejecución (Formato P-3.3)",
        "Organigrama",
        "Procedimientos",
        "Certificado de visita a obra",
        "Personal mínimo",
        "Equipo (Formato 3.8)",
        "Formulario de cantidades de obra y precios unitarios y valor de la oferta (Formatos P-3.10)",
        "Análisis de precios unitarios (Formato P-2.2.13)",
        "Sagrilaft",
        "Certificado Sistema de Gestión",
        "Botadero actualizado",
        "Póliza de seriedad",
        "RUT",
        "Composición accionaria",
        "certificación bancaria",
        "CC Representante legal",
      ];

      nuevoForm
        .addCheckboxItem()
        .setTitle("DOCUMENTACION REQUERIDA")
        .setChoiceValues(listaDocumentos)
        .setRequired(true);

      // Pregunta 3
      nuevoForm
        .addCheckboxItem()
        .setTitle(
          "Formulario de cantidades de obra y precios unitarios y valor de la oferta (Formatos P-3.10)",
        )
        .setChoiceValues(["Formato 1", "Formato 2", "Formato 3"])
        .setRequired(true);

      // ------------------------------------------------------------------
      // 3. CREAR LA HOJA DE RESPUESTAS Y MOVER ARCHIVOS
      // ------------------------------------------------------------------
      const nuevaHoja = SpreadsheetApp.create(
        "Respuestas Licitación - " + nombreObra,
      );
      const idHoja = nuevaHoja.getId();

      DriveApp.getFileById(nuevoForm.getId()).moveTo(nuevaCarpeta);
      DriveApp.getFileById(idHoja).moveTo(nuevaCarpeta);

      // ------------------------------------------------------------------
      // 4. VINCULAR FORMULARIO A LA HOJA
      // ------------------------------------------------------------------
      nuevoForm.setDestination(FormApp.DestinationType.SPREADSHEET, idHoja);

      // ------------------------------------------------------------------
      // 5. CREAR DISPARADOR AUTOMÁTICO EN LA HOJA
      // ------------------------------------------------------------------
      // Importante: La función "crearSubcarpetasDesdeHoja" debe existir en este mismo proyecto de Automatizaciones
      ScriptApp.newTrigger("crearSubcarpetasDesdeHoja")
        .forSpreadsheet(idHoja)
        .onFormSubmit()
        .create();

      console.log("✅ Formulario completo, Hoja vinculada y Activador listo.");
    }
  } catch (err) {
    console.error("Error en el generador: " + err.toString());
  }
}
