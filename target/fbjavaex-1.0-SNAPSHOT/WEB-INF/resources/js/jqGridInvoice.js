var JqGridInvoice = (function ($, jqGridProductFactory, jqGridCustomerFactory) {

    return function (options) {
        var jqGridInvoice = {
            dbGrid: null,
            // опции
            options: $.extend({
                baseAddress: null
            }, options),
            _initGrid: function () {
                // url для получения данных
                var url = jqGridInvoice.options.baseAddress + '/invoice/getdata';
                jqGridInvoice.dbGrid = $("#jqGridInvoice").jqGrid({
                    url: url,
                    datatype: "json", // формат получения данных
                    mtype: "GET", // тип http запроса
                    // описание модели
                    colModel: [
                        {
                            label: 'Id', // подпись
                            name: 'INVOICE_ID', // имя поля
                            key: true, // признак ключевого поля   
                            hidden: true         // скрыт 
                        },
                        {
                            label: 'Customer Id', // подпись
                            name: 'CUSTOMER_ID', // имя поля
                            hidden: true, // скрыт 
                            editrules: {edithidden: true, required: true}, // скрытое и требуемое
                            editable: true, // редактируемое
                            edittype: 'custom', // собственный тип
                            editoptions: {
                                custom_element: function (value, options) {
                                    // добавляем скрытый input
                                    return $("<input>")
                                            .attr('type', 'hidden')
                                            .attr('rowid', options.rowId)
                                            .addClass("FormElement")
                                            .addClass("form-control")
                                            .val(value)
                                            .get(0);
                                }
                            }
                        },
                        {
                            label: 'Date',
                            name: 'INVOICE_DATE',
                            width: 60, // ширина
                            sortable: true, // позволять сортировку
                            editable: true, // редактируемое
                            search: true, // разрешён поиск
                            edittype: "text", // тип поля ввода
                            align: "right", // выравнено по правому краю
                            formatter: 'date', // отформатировано как дата
                            sorttype: 'date', // сортируем как дату
                            formatoptions: {// формат даты
                                srcformat: 'Y-m-d\TH:i:s',
                                newformat: 'd.m.Y H:i:s'
                            },
                            editoptions: {
                                // иницивлизация элемента формы для редактирования
                                dataInit: function (element) {
                                    // создаём datepicker
                                    $(element).datepicker({
                                        id: 'invoiceDate_datePicker',
                                        dateFormat: 'dd.mm.yy',
                                        minDate: new Date(2000, 0, 1),
                                        maxDate: new Date(2030, 0, 1)
                                    });
                                }
                            },
                            searchoptions: {
                                // иницивлизация элемента формы для поиска
                                dataInit: function (element) {
                                    // создаём datepicker
                                    $(element).datepicker({
                                        id: 'invoiceDate_datePicker',
                                        dateFormat: 'dd.mm.yy',
                                        minDate: new Date(2000, 0, 1),
                                        maxDate: new Date(2030, 0, 1)
                                    });
                                },
                                searchoptions: {// типы поиска
                                    sopt: ['eq', 'lt', 'le', 'gt', 'ge']
                                }
                            }
                        },
                        {
                            label: 'Customer',
                            name: 'CUSTOMER_NAME',
                            width: 250,
                            editable: true,
                            edittype: "text",
                            editoptions: {
                                size: 50,
                                maxlength: 60,
                                readonly: true    // только чтение
                            },
                            editrules: {required: true},
                            search: true,
                            searchoptions: {
                                sopt: ['eq', 'bw', 'cn']
                            }
                        },
                        {
                            label: 'Amount',
                            name: 'TOTAL_SALE',
                            width: 60,
                            sortable: false,
                            editable: false,
                            search: false,
                            align: "right",
                            formatter: 'currency', // форматировать как валюту
                            sorttype: 'number',
                            searchrules: {
                                "required": true,
                                "number": true,
                                "minValue": 0
                            }
                        },
                        {
                            label: 'Paid',
                            name: 'PAID',
                            width: 30,
                            sortable: false,
                            editable: true,
                            search: true,
                            searchoptions: {
                                sopt: ['eq']
                            },
                            edittype: "checkbox", // галочка
                            formatter: "checkbox",
                            stype: "checkbox",
                            align: "center",
                            editoptions: {
                                value: "1",
                                offval: "0"
                            }
                        }
                    ],
                    rowNum: 500, // число отображаемых строк
                    loadonce: false, // загрузка только один раз
                    sortname: 'INVOICE_DATE', // сортировка по умолчанию по столбцу даты
                    sortorder: "desc", // порядок сортировки
                    width: window.innerWidth - 80, // ширина грида
                    height: 500, // высота грида
                    viewrecords: true, // отображать количество записей
                    caption: "Invoices", // подпись к гриду
                    pager: '#jqPagerInvoice', // элемент для отображения постраничной навигации
                    subGrid: true, // показывать вложенвй грид
                    // javascript функция для отображения родительского грида
                    subGridRowExpanded: jqGridInvoice.showChildGrid,
                    subGridOptions: {// опции вложенного грида
                        // загружать данные только один раз
                        reloadOnExpand: false,
                        // загружать строки подгрида только при щелчке по иконке "+"
                        selectOnExpand: true
                    }
                });
            },
            // возвращает шаблон диалога редактирования
            _getTemplate: function() {
                var template = "<div style='margin-left:15px;' id='dlgEditInvoice'>";
                template += "<div>{CUSTOMER_ID} </div>";
                template += "<div> Date: </div><div>{INVOICE_DATE}</div>";
                // поле ввода заказчика с кнопкой
                template += "<div> Customer <sup>*</sup>:</div>";
                template += "<div>";
                template += "<div style='float: left;'>{CUSTOMER_NAME}</div> ";
                template += "<a style='margin-left: 0.2em;' class='btn' onclick='invoiceGrid.showCustomerWindow(); return false;'>";
                template += "<span class='glyphicon glyphicon-folder-open'></span>Выбрать</a> ";
                template += "<div style='clear: both;'></div>";
                template += "</div>";
                template += "<div> {PAID} Paid </div>";
                template += "<hr style='width: 100%;'/>";
                template += "<div> {sData} {cData}  </div>";
                template += "</div>";
                return template;
            },
            _initPager: function () {
                // отображение панели навигации
                jqGridInvoice.dbGrid.jqGrid('navGrid', '#jqPagerInvoice',
                        {
                            search: true, // поиск
                            add: true, // добавление
                            edit: true, // редактирование
                            del: true, // удаление
                            view: false, // просмотр записи
                            refresh: true, // обновление

                            searchtext: "Поиск",
                            addtext: "Добавить",
                            edittext: "Изменить",
                            deltext: "Удалить",
                            viewtext: "Смотреть",
                            viewtitle: "Выбранная запись",
                            refreshtext: "Обновить"
                        },
                        // опции редактирования
                        {
                            url: jqGridInvoice.options.baseAddress + '/invoice/edit',
                            reloadAfterSubmit: true,
                            closeOnEscape: true,
                            closeAfterEdit: true,
                            drag: true,
                            modal: true,
                            top: $(".container.body-content").position().top + 150,
                            left: $(".container.body-content").position().left + 150,
                            template: jqGridInvoice._getTemplate(),
                            afterSubmit: jqGridInvoice.afterSubmit,
                            editData: {
                                INVOICE_ID: function () {
                                    var selectedRow = jqGridInvoice.dbGrid.getGridParam("selrow");
                                    var value = jqGridInvoice.dbGrid.getCell(selectedRow, 'INVOICE_ID');
                                    return value;
                                },                                
                                CUSTOMER_ID: function() {
                                    return $('#dlgEditInvoice input[name=CUSTOMER_ID]').val();
                                },
                                INVOICE_DATE: function() {
                                    var date = $('#dlgEditInvoice input[name=INVOICE_DATE]').val();
                                    if (date) {
                                        // дату надо преобразовать
                                        var dateParts = date.split('.');                      
                                        return dateParts[2].substring(0, 4) + '-' + dateParts[1] + '-' + dateParts[0] + 'T' + dateParts[2].substring(5);
                                    }
                                    else
                                        return null;
                                }
                            }                            
                        },
                        // опции добавления
                        {
                            url: jqGridInvoice.options.baseAddress + '/invoice/create',
                            reloadAfterSubmit: true,
                            closeOnEscape: true,
                            closeAfterAdd: true,
                            drag: true,
                            modal: true,
                            top: $(".container.body-content").position().top + 150,
                            left: $(".container.body-content").position().left + 150,
                            template: jqGridInvoice._getTemplate(),
                            afterSubmit: jqGridInvoice.afterSubmit,
                            addData: {
                                CUSTOMER_ID: function() {
                                    return $('#dlgEditInvoice input[name=CUSTOMER_ID]').val();
                                },
                                INVOICE_DATE: function() {
                                    var date = $('#dlgEditInvoice input[name=INVOICE_DATE]').val();
                                    if (date) {
                                        // дату надо преобразовать
                                        var dateParts = date.split('.');                      
                                        return dateParts[2].substring(0, 4) + '-' + dateParts[1] + '-' + dateParts[0] + 'T' + dateParts[2].substring(5);
                                    }
                                    else
                                        return null;
                                }                                
                            }
                        },
                        // опции удаления
                        {
                            url: jqGridInvoice.options.baseAddress + '/invoice/delete',
                            reloadAfterSubmit: true,
                            closeOnEscape: true,
                            closeAfterDelete: true,
                            drag: true,
                            msg: "Удалить выделенную счёт-фактуру?",
                            afterSubmit: jqGridInvoice.afterSubmit,
                            delData: {
                                INVOICE_ID: function () {
                                    var selectedRow = jqGridInvoice.dbGrid.getGridParam("selrow");
                                    var value = jqGridInvoice.dbGrid.getCell(selectedRow, 'INVOICE_ID');
                                    return value;
                                }
                            }                            
                        }                
                );
                // добавление кнопки для оплаты счёт фактуры
                var urlPay = jqGridInvoice.options.baseAddress + '/invoice/pay';
                jqGridInvoice.dbGrid.navButtonAdd('#jqPagerInvoice',
                        {
                            buttonicon: "glyphicon-usd",
                            title: "Оплатить",
                            caption: "Оплатить",
                            position: "last",
                            onClickButton: function () {
                                // получаем идентификатор текущей записи
                                var id = jqGridInvoice.dbGrid.getGridParam("selrow");
                                if (id) {
                                    $.ajax({
                                        url: urlPay,
                                        type: 'POST',
                                        data: {INVOICE_ID: id},
                                        success: function (data) {
                                            // проверяем не произошла ли ошибка
                                            if (data.hasOwnProperty("error")) {
                                                jqGridInvoice.alertDialog('Ошибка', data.error);
                                            } else {
                                                // обновление грида
                                                $("#jqGridInvoice").jqGrid(
                                                        'setGridParam',
                                                        {
                                                            datatype: 'json'
                                                        }
                                                ).trigger('reloadGrid');
                                            }
                                        }
                                    });
                                }
                            }
                        });
            },
            init: function() {
                jqGridInvoice._initGrid();
                jqGridInvoice._initPager();
            },
            afterSubmit: function (response, postdata) {
                var responseData = response.responseJSON;
                // проверяем результат на наличие сообщений об ошибках
                if (responseData.hasOwnProperty("error")) {
                    if (responseData.error.length) {
                        return [false, responseData.error];
                    }
                } else {
                    // обновление грида
                    $(this).jqGrid(
                       'setGridParam',
                        {
                            datatype: 'json'
                        }
                    ).trigger('reloadGrid');
                }
                return [true, "", 0];
            },            
            // обработчик события раскрытия родительского грида
            // принимает два параметра идентификатор родительской записи
            // и первичный ключ записи
            showChildGrid: function (parentRowID, parentRowKey) {
                var childGridID = parentRowID + "_table";
                var childGridPagerID = parentRowID + "_pager";

                // отправляем первичный ключ родительской записи
                // чтобы отфильтровать записи позиций накладной
                var childGridURL = jqGridInvoice.options.baseAddress + '/invoice/getdetaildata';
                childGridURL = childGridURL + "?INVOICE_ID=" + encodeURIComponent(parentRowKey);

                // добавляем HTML элементы для отображения таблицы и постраничной навигации
                // как дочерние для выбранной строки в мастер гриде
                $('<table>')
                        .attr('id', childGridID)
                        .appendTo($('#' + parentRowID));
                $('<div>')
                        .attr('id', childGridPagerID)
                        .addClass('scroll')
                        .appendTo($('#' + parentRowID));

                // создаём и инициализируем дочерний грид
                var detailGrid = $("#" + childGridID).jqGrid({
                    url: childGridURL,
                    mtype: "GET",
                    datatype: "json",
                    page: 1,
                    colModel: [
                        {
                            label: 'Invoice Line ID',
                            name: 'INVOICE_LINE_ID',
                            key: true,
                            hidden: true
                        },
                        {
                            label: 'Invoice ID',
                            name: 'INVOICE_ID',
                            hidden: true,
                            editrules: {edithidden: true, required: true},
                            editable: true,
                            edittype: 'custom',
                            editoptions: {
                                custom_element: function (value, options) {
                                    // создаём скрытый эелемент ввода
                                    return $("<input>")
                                            .attr('type', 'hidden')
                                            .attr('rowid', options.rowId)
                                            .addClass("FormElement")
                                            .addClass("form-control")
                                            .val(parentRowKey)
                                            .get(0);
                                }
                            }
                        },
                        {
                            label: 'Product ID',
                            name: 'PRODUCT_ID',
                            hidden: true,
                            editrules: {edithidden: true, required: true},
                            editable: true,
                            edittype: 'custom',
                            editoptions: {
                                custom_element: function (value, options) {
                                    // создаём скрытый эелемент ввода
                                    return $("<input>")
                                            .attr('type', 'hidden')
                                            .attr('rowid', options.rowId)
                                            .addClass("FormElement")
                                            .addClass("form-control")
                                            .val(value)
                                            .get(0);
                                }
                            }
                        },
                        {
                            label: 'Product',
                            name: 'PRODUCT_NAME',
                            width: 300,
                            editable: true,
                            edittype: "text",
                            editoptions: {
                                size: 50,
                                maxlength: 60,
                                readonly: true
                            },
                            editrules: {required: true}
                        },
                        {
                            label: 'Price',
                            name: 'SALE_PRICE',
                            formatter: 'currency',
                            editable: true,
                            editoptions: {
                                readonly: true
                            },
                            align: "right",
                            width: 100
                        },
                        {
                            label: 'Quantity',
                            name: 'QUANTITY',
                            align: "right",
                            width: 100,
                            editable: true,
                            editrules: {required: true, number: true, minValue: 1},
                            editoptions: {
                                dataEvents: [
                                    {
                                        type: 'change',
                                        fn: function (e) {
                                            var quantity = $(this).val() - 0;
                                            var price = $('#dlgEditInvoiceLine input[name=SALE_PRICE]').val() - 0;
                                            $('#dlgEditInvoiceLine input[name=TOTAL]').val(quantity * price);
                                        }
                                    }
                                ],
                                defaultValue: 1
                            }
                        },
                        {
                            label: 'Total',
                            name: 'TOTAL',
                            formatter: 'currency',
                            align: "right",
                            width: 100,
                            editable: true,
                            editoptions: {
                                readonly: true
                            }
                        }
                    ],
                    loadonce: false,
                    width: '100%',
                    height: '100%',
                    pager: "#" + childGridPagerID
                });
                // отображение панели инструментов
                $("#" + childGridID).jqGrid('navGrid', '#' + childGridPagerID,
                        {
                            search: false, // поиск
                            add: true, // добавление
                            edit: true, // редактирование
                            del: true, // удаление
                            refresh: true // обновление
                        },
                        jqGridInvoice.updateDetail(detailGrid, "edit"), // обновление
                        jqGridInvoice.updateDetail(detailGrid, "add"), // добавление
                        jqGridInvoice.updateDetail(detailGrid, "del") // удаление
                        );
            },
            updateDetail: function (detailGrid, act) {
                // шаблон диалога редактирования
                var template = "<div style='margin-left:15px;' id='dlgEditInvoiceLine'>";
                template += "<div>{INVOICE_ID} </div>";
                template += "<div>{PRODUCT_ID} </div>";
                // поле ввода товара с кнопкой
                template += "<div> Product <sup>*</sup>:</div>";
                template += "<div>";
                template += "<div style='float: left;'>{PRODUCT_NAME}</div> ";
                template += "<a style='margin-left: 0.2em;' class='btn' onclick='invoiceGrid.showProductWindow(); return false;'>";
                template += "<span class='glyphicon glyphicon-folder-open'></span> Выбрать</a> ";
                template += "<div style='clear: both;'></div>";
                template += "</div>";
                template += "<div> Quantity: </div><div>{QUANTITY} </div>";
                template += "<div> Price: </div><div>{SALE_PRICE} </div>";
                template += "<div> Total: </div><div>{TOTAL} </div>";
                template += "<hr style='width: 100%;'/>";
                template += "<div> {sData} {cData}  </div>";
                template += "</div>";

                var url = jqGridInvoice.options.baseAddress + '/invoice';

                return {
                    top: $(".container.body-content").position().top + 150,
                    left: $(".container.body-content").position().left + 150,
                    modal: true,
                    drag: true,
                    closeOnEscape: true,
                    closeAfterAdd: true, // закрыть после добавления
                    closeAfterEdit: true, // закрыть после редактирования
                    reloadAfterSubmit: true, // обновление
                    template: (act !== "del") ? template : null,
                    onclickSubmit: function (params, postdata) {
                        var selectedRow = detailGrid.getGridParam("selrow");
                        switch (act) {
                            case "add":
                                params.url = url + '/createdetail';
                                // получаем идентификатор счёт-фактуры
                                postdata.INVOICE_ID = $('#dlgEditInvoiceLine input[name=INVOICE_ID]').val();
                                // получаем идентификатор товара для текущей записи
                                postdata.PRODUCT_ID = $('#dlgEditInvoiceLine input[name=PRODUCT_ID]').val();
                                break;

                            case "edit":
                                params.url = url + '/editdetail';
                                // получаем идентификатор текущей записи
                                postdata.INVOICE_LINE_ID = selectedRow;
                                break;

                            case "del":
                                params.url = url + '/deletedetail';
                                // получаем идентификатор текущей записи
                                postdata.INVOICE_LINE_ID = selectedRow;
                                break;
                        }
                    },
                    afterSubmit: function (response, postdata) {
                        var responseData = response.responseJSON;
                        // проверяем результат на наличие сообщений об ошибках
                        if (responseData.hasOwnProperty("error")) {
                            if (responseData.error.length) {
                                return [false, responseData.error];
                            }
                        } else {
                            // обновление грида
                            $(this).jqGrid(
                                    'setGridParam',
                                    {
                                        datatype: 'json'
                                    }
                            ).trigger('reloadGrid');
                        }
                        return [true, "", 0];
                    }
                };
            },
            // отображение окна выбора продукта из справочника
            showProductWindow: function () {
                var dlg = $('<div>')
                        .attr('id', 'dlgChooseProduct')
                        .attr('aria-hidden', 'true')
                        .attr('role', 'dialog')
                        .attr('data-backdrop', 'static')
                        .css("z-index", '2000')
                        .addClass('modal')
                        .appendTo($('body'));

                var dlgContent = $("<div>")
                        .addClass("modal-content")
                        .css('width', '760px')
                        .appendTo($('<div>')
                                .addClass('modal-dialog')
                                .appendTo(dlg));

                var dlgHeader = $('<div>').addClass("modal-header").appendTo(dlgContent);
                $("<button>")
                        .addClass("close")
                        .attr('type', 'button')
                        .attr('aria-hidden', 'true')
                        .attr('data-dismiss', 'modal')
                        .html("&times;")
                        .appendTo(dlgHeader);
                $("<h5>").addClass("modal-title").html("Выбор заказчика").appendTo(dlgHeader);

                var dlgBody = $('<div>')
                        .addClass("modal-body")
                        .appendTo(dlgContent);

                var dlgFooter = $('<div>').addClass("modal-footer").appendTo(dlgContent);
                $("<button>")
                        .attr('type', 'button')
                        .addClass('btn')
                        .html('OK')
                        .on('click', function () {
                            var rowId = $("#jqGridProduct").jqGrid("getGridParam", "selrow");
                            var row = $("#jqGridProduct").jqGrid("getRowData", rowId);

                            $('#dlgEditInvoiceLine input[name=PRODUCT_ID]').val(rowId);
                            $('#dlgEditInvoiceLine input[name=NAME]').val(row["NAME"]);
                            $('#dlgEditInvoiceLine input[name=price]').val(row["PRICE"]);
                            var price = $('#dlgEditInvoiceLine input[name=PRICE]').val() - 0;
                            var quantity = $('#dlgEditInvoiceLine input[name=QUANTITY]').val() - 0;
                            $('#dlgEditInvoiceLine input[name=TOTAL]').val(price * quantity);
                            dlg.modal('hide');
                        })
                        .appendTo(dlgFooter);
                $("<button>")
                        .attr('type', 'button')
                        .addClass('btn')
                        .html('Cancel')
                        .on('click', function () {
                            dlg.modal('hide');
                        })
                        .appendTo(dlgFooter);

                $('<table>')
                        .attr('id', 'jqGridProduct')
                        .appendTo(dlgBody);
                $('<div>')
                        .attr('id', 'jqPagerProduct')
                        .appendTo(dlgBody);

                dlg.on('hidden.bs.modal', function () {
                    dlg.remove();
                });

                dlg.modal();

                jqGridProductFactory({
                    baseAddress: jqGridInvoice.options.baseAddress
                });
            },
            // отображение окна выбора заказчика из справочника
            showCustomerWindow: function() {
                // основной блок диалога
                var dlg = $('<div>')
                        .attr('id', 'dlgChooseCustomer')
                        .attr('aria-hidden', 'true')
                        .attr('role', 'dialog')
                        .attr('data-backdrop', 'static')
                        .css("z-index", '2000')
                        .addClass('modal')
                        .appendTo($('body'));

                // блок с содержимым диалога
                var dlgContent = $("<div>")
                        .addClass("modal-content")
                        .css('width', '730px')
                        .appendTo($('<div>')
                                .addClass('modal-dialog')
                                .appendTo(dlg));

                // блок с шапкой диалога
                var dlgHeader = $('<div>').addClass("modal-header").appendTo(dlgContent);
                // кнопка "X" для закрытия
                $("<button>")
                        .addClass("close")
                        .attr('type', 'button')
                        .attr('aria-hidden', 'true')
                        .attr('data-dismiss', 'modal')
                        .html("&times;")
                        .appendTo(dlgHeader);
                // подпись
                $("<h5>").addClass("modal-title").html("Выбор заказчика").appendTo(dlgHeader);

                // тело диалога
                var dlgBody = $('<div>')
                        .addClass("modal-body")
                        .appendTo(dlgContent);

                // подвал диалога
                var dlgFooter = $('<div>').addClass("modal-footer").appendTo(dlgContent);
                // Кнопка "OK"
                $("<button>")
                        .attr('type', 'button')
                        .addClass('btn')
                        .html('OK')
                        .on('click', function () {
                            var rowId = $("#jqGridCustomer").jqGrid("getGridParam", "selrow");
                            var row = $("#jqGridCustomer").jqGrid("getRowData", rowId);
                            // сохраняем идентификатор и имя заказчика
                            // в элементы ввода родительской формы
                            $('#dlgEditInvoice input[name=CUSTOMER_ID]').val(rowId);
                            $('#dlgEditInvoice input[name=CUSTOMER_NAME]').val(row["NAME"]);
                            dlg.modal('hide');
                        })
                        .appendTo(dlgFooter);
                // Кнопка "Cancel"
                $("<button>")
                        .attr('type', 'button')
                        .addClass('btn')
                        .html('Cancel')
                        .on('click', function () {
                            dlg.modal('hide');
                        })
                        .appendTo(dlgFooter);
                // добавляем таблицу для отображения заказчиков в тело диалога
                $('<table>')
                        .attr('id', 'jqGridCustomer')
                        .appendTo(dlgBody);
                // добавляем паенль навигации
                $('<div>')
                        .attr('id', 'jqPagerCustomer')
                        .appendTo(dlgBody);

                dlg.on('hidden.bs.modal', function () {
                    dlg.remove();
                });

                // отображаем диалог
                dlg.modal();
                
                jqGridCustomerFactory({
                    baseAddress: jqGridInvoice.options.baseAddress
                });                
            },
            // Окно для отображения ошибки
            alertDialog: function(title, error) {
                var alertDlg = $('<div>')
                        .attr('aria-hidden', 'true')
                        .attr('role', 'dialog')
                        .attr('data-backdrop', 'static')
                        .addClass('modal')
                        .appendTo($('body'));

                var dlgContent = $("<div>")
                        .addClass("modal-content")
                        .appendTo($('<div>')
                                .addClass('modal-dialog')
                                .appendTo(alertDlg));

                var dlgHeader = $('<div>').addClass("modal-header").appendTo(dlgContent);
                $("<button>")
                        .addClass("close")
                        .attr('type', 'button')
                        .attr('aria-hidden', 'true')
                        .attr('data-dismiss', 'modal')
                        .html("&times;")
                        .appendTo(dlgHeader);
                $("<h5>").addClass("modal-title").html(title).appendTo(dlgHeader);

                var dlgBody = $('<div>')
                        .addClass("modal-body")
                        .appendTo(dlgContent)
                        .append(error);

                alertDlg.on('hidden.bs.modal', function () {
                    alertDlg.remove();
                });

                alertDlg.modal();                
            }
        };
        jqGridInvoice.init();
        return jqGridInvoice;
    };
})(jQuery, JqGridProduct, JqGridCustomer);

