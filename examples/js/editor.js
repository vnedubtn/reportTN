/* global ace, $, PDFObject, pdf, doc */
/**
 * jsPDFEditor
 * @return {[type]} [description]
 */
var jsPDFEditor = function () {

	var editor, demos = {
		'images.js': 'Images',
		'font-faces.js': 'Font faces, text alignment and rotation',
		'two-page.js': 'Two page Hello World',
		'circles.js': 'Circles',
		'cell.js': 'Cell',
		'font-size.js': 'Font sizes',
		'landscape.js': 'Landscape',
		'lines.js': 'Lines',
		'rectangles.js': 'Rectangles',
		'string-splitting.js': 'String Splitting',
		'text-colors.js': 'Text colors',
		'triangles.js': 'Triangles',
		'user-input.js': 'User input',
		'acroforms.js': 'AcroForms',
		'autoprint.js': 'Auto print',
		'arabic.js': 'Arabic',
		'russian.js': 'Russian',
		'japanese.js': 'Japanese'
	};

	var aceEditor = function () {
		editor = ace.edit("editor");
		editor.setTheme("ace/theme/github");
		editor.setOptions({
			fontFamily: "monospace",
			fontSize: "12px"
		});
		editor.getSession().setMode("ace/mode/javascript");
		editor.getSession().setUseWorker(false); // prevent "SecurityError: DOM Exception 18"

		var timeout;
		editor.getSession().on('change', function () {
			// Hacky workaround to disable auto refresh on user input
			if ($('#auto-refresh').is(':checked') && $('#template').val() != 'user-input.js') {
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(function () {
					jsPDFEditor.update();
				}, 200);
			}
		});
	};

	var populateDropdown = function () {
		var options = '';
		for (var demo in demos) {
			options += '<option value="' + demo + '">' + demos[demo] + '</option>';
		}
		$('#template').html(options).on('change', loadSelectedFile);
	};

	var loadSelectedFile = function () {
		if ($('#template').val() == 'user-input.js') {
			$('.controls .checkbox').hide();
			$('.controls .alert').show();
			jsPDFEditor.update(true);
		} else {
			$('.controls .checkbox').show();
			$('.controls .alert').hide();
		}

		$.get('examples/js/' + $('#template').val(), function (response) {
			editor.setValue(response);
			editor.gotoLine(0);

			// If autorefresh isn't on, then force it when we change examples
			if (!$('#auto-refresh').is(':checked')) {
				jsPDFEditor.update();
			}

		}, 'text').fail(function () {

			$('.template-picker').html('<p class="source">More examples in <b>examples/js/</b>. We can\'t load them in automatically because of local filesystem security precautions.</p>');

			// Fallback source code
			var source = "// You'll need to make your image into a Data URL\n";
			source += "// Use http://dataurl.net/#dataurlmaker\n";
			
			source += "\n";
			source +="var sizeFont=14;\n\nvar ngang_hoten=100;\nvar doc_hoten=100;\n\nvar ngang_ngaysinh=100;\nvar doc_ngaysinh=120;\n\nvar ngang_gioitinh=100;\nvar doc_gioitinh=140;\n\nvar ngang_dantoc=100;\nvar doc_dantoc=160;\n\nvar ngang_noisinh=100;\nvar doc_noisinh=180;\n\nvar ngang_lop=100;\nvar doc_lop=200;\n\nvar ngang_xeploaiTN=100;\nvar doc_xeploaiTN=220;\n\nvar ngang_soVB=100;\nvar doc_soVB=240;\n";
			// source += "var doc = new jsPDF({unit: \"pt\",orientation: \"p\",lineHeight: 1.2});\n";
			// source += "\n";
			
			// source += "doc.addFont(\"Arimo-Regular.ttf\", \"Arimo\", \"normal\");\n//doc.addFont(\"Arimo-Bold.ttf\", \"Arimo\", \"bold\");\ndoc.setFont(\"Arimo\");\ndoc.setFontType(\"normal\");\ndoc.setFontSize(28);\n";
			// source += "doc.text(\"rồi\", 40, 30, 4);\n";
			// source += "doc.addPage('a5','l');\n";
			// source += "var gg=job[Object.keys(job)[0]];\n";
			// source += "for(var i=0;i<gg.length;i++){\nvar item=gg[i];\nvar hoten=item[Object.keys(item)[1]];\ndoc.text(hoten, 40, 30, 0);\ndoc.addPage('a5','l');\n};\n";
			editor.setValue(source);
			editor.gotoLine(0);
		});
	};

	var initAutoRefresh = function () {
		$('#auto-refresh').on('change', function () {
			if ($('#auto-refresh').is(':checked')) {
				$('.run-code').hide();
				jsPDFEditor.update();
			} else {
				$('.run-code').show();
			}
		});

		$('.run-code').click(function () {
			jsPDFEditor.update();
			return false;
		});
	};

	var initDownloadPDF = function () {
		$('.download-pdf').click(function () {
			eval('try{' + editor.getValue() + '} catch(e) { console.error(e.message,e.stack,e); }');

			var file = demos[$('#template').val()];
			if (file === undefined) {
				file = 'demo';
			}
			if (typeof doc !== 'undefined') {
				doc.save(file + '.pdf');
			} else if (typeof pdf !== 'undefined') {
				setTimeout(function () {
					pdf.save(file + '.pdf');
				}, 2000);
			} else {
				alert('Error 0xE001BADF');
			}
		});
		return false;
	};

	return {
		/**
		 * Start the editor demo
		 * @return {void}
		 */
		init: function () {

			// Init the ACE editor
			aceEditor();

			populateDropdown();
			loadSelectedFile();
			// Do the first update on init
			jsPDFEditor.update();

			initAutoRefresh();

			initDownloadPDF();
		},
		/**
		 * Update the iframe with current PDF.
		 *
		 * @param  {boolean} skipEval If true, will skip evaluation of the code
		 * @return
		 */
		update: function (skipEval) {
			setTimeout(function () {
				
				if (!skipEval) {
					eval('try{' + editor.getValue() + '} catch(e) { console.error(e.message,e.stack,e); }');
					var doc = new jsPDF({unit: "pt",orientation: "l",lineHeight: 0,format:"a5"});

					doc.addFont("Arimo-Regular.ttf", "Arimo", "normal");
					doc.addFont("times.ttf", "Times", "normal");
					//doc.addFont("Arimo-Bold.ttf", "Arimo", "bold");
					doc.setFont("Times");
					doc.setFontType("normal");
					doc.setFontSize(sizeFont);
					//doc.text("rồi", cngang, cdoc, 0);
					//doc.addPage('a5','l');
					var gg=job[Object.keys(job)[0]];
					for(var i=0;i<gg.length;i++){
						var item=gg[i];
						
						var hoten=item[Object.keys(item)[1]];
						var ngaysinh=item[Object.keys(item)[2]];
						var gioitinh=item[Object.keys(item)[3]];
						var dantoc=item[Object.keys(item)[4]];
						var noisinh=item[Object.keys(item)[5]];
						var lop=item[Object.keys(item)[6]];
						var xltn=item[Object.keys(item)[7]];
						var sovb=item[Object.keys(item)[8]];
						
						doc.text(hoten, ngang_hoten, doc_hoten, 0);
						doc.text(ngaysinh, ngang_ngaysinh, doc_ngaysinh, 0);
						doc.text(gioitinh, ngang_gioitinh, doc_gioitinh, 0);
						doc.text(dantoc, ngang_dantoc, doc_dantoc, 0);
						doc.text(noisinh, ngang_noisinh, doc_noisinh, 0);
						doc.text(lop, ngang_lop, doc_lop, 0);
						doc.text(xltn, ngang_xeploaiTN, doc_xeploaiTN, 0);
						doc.text(sovb, ngang_soVB, doc_soVB, 0);
						
						if(gg.length-i>1)
							doc.addPage('a5','l');
					};
				}
				if (typeof doc !== 'undefined') try {
					////////////////////////////////
					
					
					////////////////////////////////
					if (navigator.appVersion.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Edge") !== -1 || navigator.appVersion.indexOf('Trident') !== -1) {
						var options = {
							pdfOpenParams: {
								navpanes: 0,
								toolbar: 0,
								statusbar: 0,
								view: "FitV"
							},
							forcePDFJS: true,
							PDFJS_URL: 'examples/PDF.js/web/viewer.html'
						};
						PDFObject.embed(doc.output('bloburl'), "#preview-pane", options);
					} else {
						
					
						PDFObject.embed(doc.output('datauristring'), "#preview-pane");
					}
				} catch (e) {
					alert('Error ' + e);
				}
			}, 0);
			
		}
	};

}();

// $(document).ready(function () {
	// jsPDFEditor.init();
// });
