function create_connector(article, line_height, note_id, link, left) {
  var connector = $('<div class="note-connector" data-note-id="' + note_id + '"></div>');
  connector.css('top', link.position().top + link.height());
  if (left) {
    connector.css('right', (article.width() - link.position().left));
    connector.css('left', '-2em');
  } else {
    if (link.height() > line_height) {
      // We've got a link that wraps lines, which makes it basically impossible to tell
      // where the last line ends, but we know that the last line will be flush with
      // the left side of the article.
      connector.css('left', 0);
    } else {
      connector.css('left', link.position().left + link.width());
    }
    connector.css('right', '-2em');
  }
  article.append(connector);
  return connector;
}

function color_elements(color_index, elements) {
  var color_class = 'color-' + color_index;
  elements.forEach(function(el) {
    el.addClass(color_class);
  });
}

function toggle_active_on_click(target, elements) {
  target.on('click', function(e) {
    elements.forEach(function(el) {
      el.toggleClass('active');
    });
  });
}

function to_i(s) {
  return s|0;
}

function position_note(inter_note_padding, side, top, note) {
  note.css('top', top);
  note.addClass(side);
  return top + note.height() + inter_note_padding;
}

function create_footnotes() {
  var viewport_height = $(window).height();
  document.styleSheets[0].insertRule(
    'aside { max-height: ' + viewport_height * 2 / 3 + 'px; }',
    0);

  var n_colors = 5;
  var article = $('article');
  var line_height_with_unit = getComputedStyle($('article')[0]).getPropertyValue('line-height');
  var line_height = to_i(line_height_with_unit.substring(0, line_height_with_unit.length - 2));
  var inter_note_padding = line_height * 2;
  var left_viable_top = 0;
  var right_viable_top = 0;

  $('.note-link').each(function(index, link) {
    link = $(link);
    var id = link.attr('data-note-id');
    var note = $('aside[data-note-id="' + id + '"]');

    var link_center = link.position().top + (link.height() / 2);
    var proposed_note_top = link_center - (note.height() / 2);
    var note_left = false;
    var left_badness = link.position().left;
    var right_badness = article.width() - (link.width() + link.position().left);
    var prefer_left = left_badness < right_badness;

    var try_left = function(attempt) {
      if (attempt >= left_viable_top) {
        left_viable_top = position_note(inter_note_padding, 'left', attempt, note);
        note_left = true;
        return true;
      } else {
        return false;
      }
    };

    var try_right = function(attempt) {
      if (attempt >= right_viable_top) {
        right_viable_top = position_note(inter_note_padding, 'right', attempt, note);
        return true;
      } else {
        return false;
      }
    }

    var attempt_funs = [];
    var attempt_tops = [proposed_note_top, proposed_note_top];
    if (prefer_left) {
      attempt_funs = [try_left, try_right];
    } else {
      attempt_funs = [try_right, try_left];
    }

    if (left_viable_top < right_viable_top) {
      attempt_funs.push(try_left);
      attempt_funs.push(try_right);
      attempt_tops.push(left_viable_top);
      attempt_tops.push(right_viable_top);
    } else {
      attempt_funs.push(try_right);
      attempt_funs.push(try_left);
      attempt_tops.push(right_viable_top);
      attempt_tops.push(left_viable_top);
    }

    for (var i = 0; i < attempt_funs.length; i++) {
      if (attempt_funs[i](attempt_tops[i])) {
        break;
      }
    }

    var connector = create_connector(article, line_height, id, link, note_left);
    color_elements(index % n_colors, [link, note, connector]);
    toggle_active_on_click(link, [link, note, connector]);
  });
}

$(function() {
  // This is a tragic hack.  The right answer would be to catch an event after
  // our web fonts have finished loading so that our position calculations
  // will be right.  But I don't feel like burdening our relatively-lightweight
  // pages with the google webfont loader code.  So we're going to do this
  // instead.
  if ($('aside').length > 0) {
    setTimeout(create_footnotes, 500);
  }
});
