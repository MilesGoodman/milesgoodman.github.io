const locale = 'de-DE';
const euro = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' });
const percent = new Intl.NumberFormat(locale, { style: 'percent' });
const plural = new Intl.PluralRules(locale, { type: 'cardinal' });
const yearnow = new Date().getFullYear();

const premium_percentages = {
    50: 0.16,
    49: 0.17,
    48: 0.17,
    47: 0.18,
    46: 0.18,
    45: 0.18,
    44: 0.18,
    43: 0.18,
    42: 0.19,
    41: 0.19,
    40: 0.19,
    39: 0.19,
    38: 0.2,
    37: 0.2,
    36: 0.2,
    35: 0.21,
    34: 0.21,
    33: 0.21,
    32: 0.22,
    31: 0.22,
    30: 0.22,
    29: 0.23,
    28: 0.23,
    27: 0.24,
    26: 0.24,
    25: 0.25,
    24: 0.25,
    23: 0.26,
    22: 0.26,
    21: 0.27,
    20: 0.28,
    19: 0.28,
    18: 0.29,
    17: 0.3,
    16: 0.31,
    15: 0.32,
    14: 0.33,
    13: 0.34,
    12: 0.35,
    11: 0.36,
    10: 0.38,
    9: 0.39,
    8: 0.41,
    7: 0.43,
    6: 0.45,
    5: 0.47,
    4: 0.50,
    3: 0.53,
    2: 0.56,
    1: 0.60,
    h: 0.74,
    0: 1,
    m: 1.35,
}
const reclassifications = {
    50: 25,
    49: 25,
    48: 25,
    47: 24,
    46: 24,
    45: 23,
    44: 23,
    43: 22,
    42: 22,
    41: 21,
    40: 20,
    39: 20,
    38: 19,
    37: 19,
    36: 18,
    35: 18,
    34: 17,
    33: 17,
    32: 16,
    31: 16,
    30: 15,
    29: 14,
    28: 14,
    27: 13,
    26: 13,
    25: 12,
    24: 12,
    23: 11,
    22: 10,
    21: 10,
    20: 9,
    19: 9,
    18: 8,
    17: 7,
    16: 7,
    15: 6,
    14: 6,
    13: 5,
    12: 4,
    11: 4,
    10: 3,
    9: 3,
    8: 2,
    7: 1,
    6: 1,
    5: 1,
    4: 'h',
    3: 'h',
    2: 'h',
    1: 'h',
    h: 0,
    0: 'm',
    m: 'm',
}

function display_sfclass(sfclass) {
    const translations = {
        h: '1/2',
        m: 'M',
    }
    if (sfclass in translations) return translations[sfclass];
    return sfclass;
}

function increment_sfclass(sfclass) {
    switch (sfclass) {
        case 'm':
            return 0;
        case 0:
            return 'h';
        case 'h':
            return 1;
        case 50:
            return 50;
        default:
            return sfclass + 1;
    }
}

var base_premium, sf_now, sf_reclassed;

function form_sf(formelements) {
    var inp_premium = parseFloat($(formelements['inp-premium']).val());
    var inp_sfclass = $(formelements['inp-sfclass']).val().trim().toLowerCase();
    var inp_sfclass_strings = {
        '1/2': 'h',
        'm': 'm'
    }
    if (inp_sfclass in inp_sfclass_strings) {
        inp_sfclass = inp_sfclass_strings[inp_sfclass];
    } else {
        inp_sfclass = parseInt(inp_sfclass);
    }

    sf_now = inp_sfclass;
    sf_reclassed = reclassifications[sf_now];
    base_premium = inp_premium / premium_percentages[sf_now];            
    
    var new_sfclass = display_sfclass(sf_reclassed);
    $('.new-sfclass').removeClass('na').text(new_sfclass);

    var new_premium = base_premium * premium_percentages[sf_reclassed];
    $('.new-premium').removeClass('na').text(euro.format(new_premium));
    $('.new-premium-increase').removeClass('na').text(euro.format(new_premium - inp_premium));

    add_years_to_costtable(5);
    update_freeyears();
    $('#button-sf').prop('disabled', true);
    $('.postform').show();
}

function add_years_to_costtable(count) {
    var $costtable = $('.costtable');
    var $row_with_morebutton = $('.moreyears-button-row')
    var startyear = yearnow;
    var endyear_in_table = $costtable.data('year');
    var endyear_target = endyear_in_table + count;

    for (var year = startyear; year < endyear_target; year++) {
        var sf1_for_iteration = sf_now;
        var premium_unchanged = base_premium * premium_percentages[sf1_for_iteration];
        var sf2_for_iteration = sf_reclassed;
        var premium_reclassed = base_premium * premium_percentages[sf2_for_iteration];
        for (var j = 0; j < year - startyear; j++) {
            sf1_for_iteration = increment_sfclass(sf1_for_iteration);
            premium_unchanged += base_premium * premium_percentages[sf1_for_iteration];
            sf2_for_iteration = increment_sfclass(sf2_for_iteration);
            premium_reclassed += base_premium * premium_percentages[sf2_for_iteration];
        }

        if (year < endyear_in_table) continue;

        var diff = premium_reclassed - premium_unchanged;
        differences.push(diff);
        var diff_percent = diff / premium_unchanged;
        $row_with_morebutton.before(
            $('<tr>').addClass('costtable-yearrow').append(
                $('<td>').text(year),
                $('<td>').text(euro.format(premium_reclassed)),
                $('<td>').text(euro.format(premium_unchanged)),
                $('<td>').append(
                    $('<span>').text(euro.format(diff)),
                    $('<span>').html('&emsp;('),
                    $('<span>').text(percent.format(diff_percent)),
                    $('<span>').text(')')
                )
            )
        );
    }

    $costtable.data('year', endyear_target);
}

function calc_freeyears(cost) {
    const maximum = 30;
    for (var years = 0; true; years++) {
        var sf1_for_iteration = sf_now;
        var premium_unchanged = base_premium * premium_percentages[sf1_for_iteration];
        var sf2_for_iteration = sf_reclassed;
        var premium_reclassed = base_premium * premium_percentages[sf2_for_iteration];
        for (var j = 0; j < years; j++) {
            sf1_for_iteration = increment_sfclass(sf1_for_iteration);
            premium_unchanged += base_premium * premium_percentages[sf1_for_iteration];
            sf2_for_iteration = increment_sfclass(sf2_for_iteration);
            premium_reclassed += base_premium * premium_percentages[sf2_for_iteration];
        }
        if (premium_unchanged + cost <= premium_reclassed) {
            return [true, years];
        }
        if (years >= maximum) {
            return [false, years];
        }        
    }
    return [false, 0];
}

function update_freeyears() {
    var input_cost = parseFloat($('#inp2-costcheck').val());
    if (isNaN(input_cost)) {
        $('.output.free-years-number').addClass('na').text('?');
        $('.output.free-years-text').text('Jahre');
        return;
    }
    var result = calc_freeyears(input_cost);
    var freeyears_number = result[1];
    var freeyears_text = 'Jahre';
    if (plural.select(freeyears_number) == 'one') {
        freeyears_text = 'Jahr';
    }
    if (!result[0]) {
        freeyears_number = 'mehr als ' + freeyears_number;
    }
    $('.output.free-years-number').removeClass('na').text(freeyears_number);
    $('.output.free-years-text').text(freeyears_text);
}

$.when($.ready).then(function() {
    $('.costtable').data('year', yearnow);
    
    $('#form-sf').on('submit', function(event) {
        event.preventDefault();
        form_sf($(this)[0].elements);
    });

    $('#button-moreyears').on('click', function(event) {
        event.preventDefault();
        add_years_to_costtable(10);
    });

    $('#inp2-costcheck').on('input', function(event) {
        update_freeyears();
    }); 
});
