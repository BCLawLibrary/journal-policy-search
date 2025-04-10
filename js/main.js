async function fetchCSVData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch CSV");
    return Papa.parse(await response.text(), { header: true });
  } catch (error) {
    console.error(error);
    return { data: [] }; // Return empty data in case of error
  }
}

async function getJournalData(url) {
  const workData = await fetchCSVData(url);
  return workData.data.map(Object.values); // Flatten data to arrays
}

function formatJournal(rowData) {
  let [
    title,
    publisher,
    journalLink,
    policyLink,
    locations,
    embargo,
    preprint,
    postprint,
    vor,
    notes,
  ] = rowData;

  const formatTitle = () => {
    if (title !== "") {
      if (journalLink !== "") {
        title = `<a href="${journalLink}">${title} 🔗</a>`;
      }
    }
    return `<div class="card__title">${title}</div>`;
  };

  const formatPublisher = () => {
    if (publisher !== "") {
      publisher = `<div class="card__publisher"><span class="card__field">Publisher: </span>${publisher}</div>`;
    }
    return publisher;
  };

  const formatPolicy = () => {
    if (policyLink !== "") {
      policyLink = `<a href=${policyLink}>Policy 🔗</a>`;
    } else {
      policyLink = "Policy";
    }
    return policyLink;
  };

  const formatLocations = () => {
    if (locations !== "") {
      locations = `<li><span class="card__field">Allowed locations: </span>${locations}</li>`;
    }
    return locations;
  };

  const formatEmbargo = () => {
    if (embargo !== "") {
      embargo = `<li><span class="card__field">Embargo: </span>${embargo}</li>`;
    }
    return embargo;
  };

  const formatVersions = () => {
    let allowedVersions = [];
    if (preprint === "TRUE") {
      allowedVersions.push("preprint");
    }

    if (postprint === "TRUE") {
      allowedVersions.push("postprint");
    }

    if (vor === "TRUE") {
      allowedVersions.push("version of record");
    }

    return `<li><span class="card__field">Allowed versions: </span>${allowedVersions.join(
      ", "
    )}</li>`;
  };

  const formatNotes = () => {
    if (notes !== "") {
      notes = `<div class="card__note"><span class="card__field">Notes: </span>${notes}</div>`;
    }
    return notes;
  };

  titleInfo = formatTitle();
  publisherInfo = formatPublisher();
  policyInfo = formatPolicy();
  locationInfo = formatLocations();
  embargoInfo = formatEmbargo();
  versionInfo = formatVersions();
  noteInfo = formatNotes();
  return `<div class="policies__card">${titleInfo}${publisherInfo}<div class="card__policy"><div class="card__field">${policyInfo}: </div><ul>${locationInfo}${embargoInfo}${versionInfo}</ul></div>${noteInfo}</div>`;
}

function initializeTable(data) {
  const custom_columns = [
    { title: "Journal Title", visible: false },
    { title: "Publisher", visible: false },
    { title: "Journal Link", visible: false, searchable: false },
    { title: "Policy Link", visible: false, searchable: false },
    { title: "Locations", visible: false, searchable: false },
    { title: "Embargo", visible: false, searchable: false },
    { title: "Preprint", visible: false, searchable: false },
    { title: "Postprint", visible: false, searchable: false },
    { title: "Version of Record", visible: false, searchable: false },
    { title: "Notes", visible: false, searchable: false },
    { title: "Last Checked", visible: false, searchable: false },
    { title: "Journal Display", searchable: false },
  ];

  for (let row in data) {
    data[row].push(formatJournal(data[row]));
  }

  const table = new DataTable("#policies__table", {
    dom: "Bfrtp",
    autoWidth: false,
    pageLength: 5,
    data: data,
    columns: custom_columns,
    language: { search: "", searchPlaceholder: "Search journal name..." },
  });

  return table;
}

$(document).ready(function () {
  async function main(journalUrl) {
    const journalData = await getJournalData(journalUrl);
    initializeTable(journalData);

    $(".policies__loading").hide();
  }
  const journalUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT9onUjR4c1Fij1PC_t4p4L-MJWs8-_hJpuvG6KdH-RuoQawme2VR_1b5jBKUtGgbhwfPymKMDeDh7J/pub?gid=0&single=true&output=csv";
  main(journalUrl);
});
