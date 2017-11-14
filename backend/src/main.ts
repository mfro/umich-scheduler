import * as api from './api';

api.start(8081);

// import * as terms from './terms';
// import * as schedule from './schedule';
// import Course from '../../common/course';

// schedule.find(terms.WINTER_18, s => s.id == 24189).then(list => {
//     console.log(list);
// });

// function building(abbrev: string, name: string, campus: string) {
//     return {
//         abbrev,
//         name,
//         campus
//     };
// }

// const lookup = [
//     building("A&AB", "Art & Architecture Building", "North Campus"),
//     building("AH", "Angell Hall", "Central Campus"),
//     building("AL", "Walter E. Lay Automotive Lab", "North Campus"),
//     building("ALH", "Alice Lloyd Hall", "The Hill Area"),
//     building("ANNEX", "Public Policy Annex, 1015 E. Huron", "Central Campus"),
//     building("ARGUS2", "Argus Building II, Television Center, 408 S. Fourth Street", "Ann Arbor, Off Campus"),
//     building("ARGUS3", "Argus Building III, 416 S. Fourth Street", "Ann Arbor, Off Campus"),
//     building("ARR", "Location to be Arranged", "Contact Dept or Instructor"),
//     building("BAM HALL", "Blanch Anderson Moore Hall, School of Music", "North Campus"),
//     building("BELL POOL", "Margaret Bell Pool, Central Campus Recreation Building", "The Hill Area"),
//     building("BEYST", "Bob and Betty Beyster Building (formerly CSE)", "North Campus"),
//     building("BIOL STAT", "Biological Station", "Pellston, Michigan"),
//     building("BLAU", "Jeff T Blau Hall", "Central Campus"),
//     building("BMT", "Burton Memorial Tower", "Central Campus"),
//     building("BOT GARD", "Matthaei Botanical Gardens, Dixboro Road", "Ann Arbor, Off Campus"),
//     building("BSB", "Biological Science Building", "Central Campus"),
//     building("BSRB", "Biomedical Science Research Building", "Medical Campus"),
//     building("BURS", "Bursley Hall", "North Campus"),
//     building("BUS", "Business Administration", "Central Campus"),
//     building("CAMP DAVIS", "Camp Davis", "Jackson Hole, Wyoming"),
//     building("CCL", "Clarence Cook Little Building", "Central Campus"),
//     building("CCRB", "Central Campus Recreation Building", "The Hill Area"),
//     building("CHEM", "Chemistry Building", "Central Campus"),
//     building("CHRYS", "Chrysler Center", "North Campus"),
//     building("COMM PARK", "Commerce Park", "Dearborn, Michigan"),
//     building("COOL", "Cooley Building", "North Campus"),
//     building("COUZENS", "Couzens Hall", "The Hill Area"),
//     building("CPH", "Children's Psychiatric Hospital", "Medical Campus"),
//     building("CRISLER", "Crisler Arena", "South Campus"),
//     building("CCSB", "Campus Safety Services Building, 1239 Kipke Dr.", "South Campus"),
//     building("DANA", "Dana Building (School of Natural Resources & Environment)", "Central Campus"),
//     building("DANCE", "Dance Building, 1310 N University Court", "The Hill Area"),
//     building("DC", "Duderstadt Center", "North Campus"),
//     building("DENT", "Dental Building", "Central Campus"),
//     building("DOW", "Dow Engineering Building", "North Campus"),
//     building("E-BUS", "Executive Education", "Central Campus"),
//     building("EECS", "Electrical Engineering and Computer Science Building", "North Campus"),
//     building("EH", "East Hall", "Central Campus"),
//     building("EQ", "East Quadrangle", "Central Campus"),
//     building("ERB1", "Engineering Research Building 1", "North Campus"),
//     building("ERB2", "Engineering Research Building 2", "North Campus"),
//     building("EWRE", "Environmental & Water Resources Engineering Building", "North Campus"),
//     building("FA CAMP", "Fresh Air Camp, Pinckney", "Pinckney, Michigan"),
//     building("FORD LIB", "Ford Library", "North Campus"),
//     building("FXB", "Francois-Xavier Bagnoud Building", "North Campus"),
//     building("GFL", "Gorguze Family Laboratory (formerly EPB)", "North Campus"),
//     building("GGBL", "G. G. Brown Laboratory", "North Campus"),
//     building("GLIBN", "Harlan Hatcher Graduate Library, North", "Central Campus"),
//     building("HH", "Haven Hall", "Central Campus"),
//     building("HUTCH", "Hutchins Hall", "Central Campus"),
//     building("IM POOL", "Intramural Building", "South Campus"),
//     building("IOE", "Industrial and Operations Engineering Building", "North Campus"),
//     building("ISR", "Institute for Social Research", "Central Campus"),
//     building("K-BUS", "Kresge Library", "Central Campus"),
//     building("KEC", "Kellogg Eye Center", "Medical Campus"),
//     building("KEENE THTR EQ", "Keene Theater, Residential College, East Quadrangle", "Central Campus"),
//     building("KELSEY", "Kelsey Museum of Archaeology", "Central Campus"),
//     building("KHRI", "Kresge Hearing Research Institute", "Medical Campus"),
//     building("LANE", "Lane Hall", "Central Campus"),
//     building("LBME", "Lurie Biomedical Engineering Building", "North Campus"),
//     building("LEAG", "Michigan League", "Central Campus"),
//     building("LEC", "Lurie Engineering Center", "North Campus"),
//     building("LLIB", "Law Library", "Central Campus"),
//     building("LORCH", "Lorch Hall", "Central Campus"),
//     building("LSA", "Literature, Science, and the Arts Building", "Central Campus"),
//     building("LSI", "Life Sciences Institute", "Central Campus"),
//     building("LSSH", "Law School South Hall", "Central Campus"),
//     building("MARKLEY", "Mary Markley Hall", "The Hill Area"),
//     building("MAX KADE", "Max Kade House, 627 Oxford Street", "Ann Arbor, Off Campus"),
//     building("MH", "Mason Hall", "Central Campus"),
//     building("MHRI", "Mental Health Research Institute", "Medical Campus"),
//     building("MLB", "Modern Languages Building", "Central Campus"),
//     building("MONREOCTY HD", "Monroe County Health Department", "Monroe, Michigan"),
//     building("MOSHER", "Mosher Jordan Hall", "The Hill Area"),
//     building("MOTT", "C. S. Mott Children's Hospital", "Medical Campus"),
//     building("MSC1", "Medical Science, Building I", "Medical Campus"),
//     building("MSC2", "Medical Science, Building II", "Medical Campus"),
//     building("MSRB3", "Medical Science Research, Building III", "Medical Campus"),
//     building("NAME", "Naval Architecture and Marine Engineering Building", "North Campus"),
//     building("NCRB", "North Campus Recreation Building", "North Campus"),
//     building("NCRC", "North Campus Research Complex", "North Campus"),
//     building("NIB", "300 North Ingalls Building", "Medical Campus"),
//     building("400NI", "400 North Ingalls Building (old School of Nursing Building)", "Medical Campus"),
//     building("NORTHVILLEPH", "Northville State Hospital", "Northville, Michigan"),
//     building("NQ", "North Quad", "Central Campus"),
//     building("NS", "Edward Henry Kraus Natural Science Building", "Central Campus"),
//     building("OBL", "Observatory Lodge, 1402 Washington Heights", "The Hill Area"),
//     building("PALM", "Palmer Commons", "Central Campus"),
//     building("PHOENIXLAB", "Phoenix Memorial Laboratory", "North Campus"),
//     building("PIER", "Pierpont Commons", "North Campus"),
//     building("POWER CTR", "Power Center for the Performing Arts", "Central Campus"),
//     building("RACK", "Horace H. Rackham, School of Graduate Studies", "Central Campus"),
//     building("RAND", "Randall Laboratory", "Central Campus"),
//     building("R-BUS", "Ross School of Business Building", "Central Campus"),
//     building("REVELLI", "William D. Revelli Hall", "South Campus"),
//     building("ROSS AC", "Stephen M. Ross Academic Center", "South Campus"),
//     building("RUTHVEN", "A. G. Ruthven Museums Building (Natural History Museum)", "Central Campus"),
//     building("SCHEM", "Glenn E. Schembechler Hall", "South Campus"),
//     building("SEB", "School of Education Building", "Central Campus"),
//     building("SHAPIRO", "Shapiro Undergraduate Library", "Central Campus"),
//     building("SM", "Earl V. Moore Building, School of Music", "North Campus"),
//     building("SNB", "School of Nursing Building", "Medical Campus"),
//     building("SPH1", "Henry Vaughan Building, School of Public Health I", "The Hill Area"),
//     building("SPH2", "Thomas Francis, Jr Building, School of Public Health II", "The Hill Area"),
//     building("SRB", "Space Research Building", "North Campus"),
//     building("SSWB", "School of Social Work Building", "Central Campus"),
//     building("STAMPS", "Stamps Auditorium", "North Campus"),
//     building("STB", "202 South Thayer Building", "Central Campus"),
//     building("STJOSEPH HOSP", "St. Joseph Mercy Hospital", "Ann Arbor, Off Campus"),
//     building("STOCKWELL", "Stockwell Hall", "The Hill Area"),
//     building("STRNS", "Sterns Building", "North Campus"),
//     building("T&TB", "Track & Tennis Building", "Ann Arbor, Off Campus"),
//     building("TAP", "Tappan Hall", "Central Campus"),
//     building("TAUBL", "Learning Resource Center, Taubman Medical Library", "Medical Campus"),
//     building("TISCH", "Tisch Hall", "Central Campus"),
//     building("UM HOSP", "University Hospital", "Medical Campus"),
//     building("UMMA", "University of Michigan Museum of Art (Alumni Memorial Hall)", "Central Campus"),
//     building("UNION", "Michigan Union", "Central Campus"),
//     building("USB", "Undergraduate Science Building", "Central Campus"),
//     building("UTOWER", "University Towers, 1225 S. University", "Central Campus"),
//     building("VETERANSHOSP", "Veterans Administration Hospital", "Ann Arbor, Off Campus"),
//     building("WASHCTY HD", "Washtenaw County Health Department", "Ann Arbor, Off Campus"),
//     building("W-BUS", "Wyly Hall", "Central Campus"),
//     building("WDC", "Charles R. Walgreen, Jr. Drama Center", "North Campus"),
//     building("WEILL", "Joan and Sanford Weill Hall", "Central Campus"),
//     building("WEIS", "Weiser Hall (formerly Dennsion Building)", "Central Campus"),
//     building("WH", "West Hall", "Central Campus"),
//     building("WOMEN'S HOSP", "Women's Hospital", "Medical Campus"),
//     building("WQ", "West Quad", "Central Campus"),
// ]

// schedule.find(terms.WINTER_18, s => {
//     let loc = lookup.filter(c => s.location.includes(c.abbrev));

//     if (loc.length != 1) {
//         console.warn('Not found', s.location);
//         return false;
//     }

//     if (parseInt(s.credits) > 3) {
//         return false;
//     }

//     if (s.courseId > 400) {
//         return false;
//     }

//     return loc[0].campus == 'North Campus';
// }).then(all => {
//     for (let sec of all) {
//         console.log(`[${sec.getCourse()}] (${sec.credits}) ${sec.title} : ${sec.location}`);
//     }
// });
