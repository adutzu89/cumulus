# -*- Mode: Python; coding: utf-8; indent-tabs-mode: nil; tab-width: 4 -*-
### BEGIN LICENSE
# Copyright (C) 2016 Daryl Bennett <kd8bny@gmail.com>
# Maintainer Archisman Panigrahi
# Based on Stormcloud by Jono Cooper <jonocooper.com>
# Thanks to all the contributors.
# Using the Ubuntu Condensed font.
# Thanks to Adam Whitcroft <adamwhitcroft.com> for Climacons!
# This program is free software: you can redistribute it and/or modify it 
# under the terms of the GNU General Public License version 3, as published 
# by the Free Software Foundation.
# 
# This program is distributed in the hope that it will be useful, but 
# WITHOUT ANY WARRANTY; without even the implied warranties of 
# MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR 
# PURPOSE.  See the GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License along 
# with this program.  If not, see <http://www.gnu.org/licenses/>.
### END LICENSE

import locale
from locale import gettext as _
locale.textdomain('cumulus')

import subprocess
from gi.repository import Gtk, WebKit # pylint: disable=E0611
import logging
logger = logging.getLogger('cumulus')

from cumulus_lib import Window
from cumulus_lib.helpers import get_media_file

try:
    from gi.repository import Unity
except ImportError:
    pass

# See cumulus_lib.Window.py for more details about how this class works
class CumulusWindow(Window):
    __gtype_name__ = "CumulusWindow"
    
    def finish_initializing(self, builder): # pylint: disable=E1002
        """Set up the main window"""
        super(CumulusWindow, self).finish_initializing(builder)
        defaultLocale = str(locale.getdefaultlocale())
        self.box = self.builder.get_object("box")
        self.window = self.builder.get_object("cumulus_window")
        self.drag = True

        # Code for other initialization actions should be added here.
        self.webview = WebKit.WebView()
        self.box.add(self.webview)
        self.webview.props.settings.enable_default_context_menu = False
        self.webviewsettings = self.webview.get_settings()
        self.webviewsettings.set_property("javascript-can-open-windows-automatically", True)
        self.webviewsettings.set_property("enable-universal-access-from-file-uris", True)
        self.webviewsettings.set_property('enable-default-context-menu',False)
        self.webview.load_uri(get_media_file('app.html') + "?lang=" + defaultLocale[2:4])
        self.box.show_all()

        try:
            launcher = Unity.LauncherEntry.get_for_desktop_id("cumulus.desktop")
            launcher.set_property("count_visible", False)
        except NameError:
            pass

        def navigation_requested_cb(view, frame, networkRequest):
            uri = networkRequest.get_uri()
            subprocess.Popen(['xdg-open', uri])
            return 1

        def console_message_cb(widget, message, line, source):
            logger.debug('%s:%s "%s"' % (source, line, message))
            return True

        def title_changed(widget, frame, title):
            print title

            if title == "close":
                Gtk.main_quit()
            elif title == "minimize":
                self.window.iconify()

            # Disables Dragging
            elif title == "disabledrag":
                self.drag = False
            elif title == "enabledrag":
                self.drag = True
            # Opacity
            elif title == "o1":
                self.set_opacity(1.0)
            elif title == "o0.95":
                self.set_opacity(0.95)
            elif title == "o0.9":
                self.set_opacity(0.9)
            elif title == "o0.85":
                self.set_opacity(0.85)
            elif title == "o0.8":
                self.set_opacity(0.8)
            elif title == "o0.75":
                self.set_opacity(0.75)
            elif title == "o0.7":
                self.set_opacity(0.7)
            elif title == "o0.65":
                self.set_opacity(0.65)
            elif title == "o0.6":
                self.set_opacity(0.6)
            elif title == "o0.55":
                self.set_opacity(0.55)
            elif title == "o0.5":
                self.set_opacity(0.5)
            elif title == "o0.45":
                self.set_opacity(0.45)
            elif title == "o0.4":
                self.set_opacity(0.4)
            elif title == "o0.35":
                self.set_opacity(0.35)
            elif title == "o0.3":
                self.set_opacity(0.3)
            elif title == "o0.25":
                self.set_opacity(0.25)
            elif title == "o0.2":
                self.set_opacity(0.2)
            elif title == "o0.15":
                self.set_opacity(0.15)
            elif title == "o0.1":
                self.set_opacity(0.1)

            # Unity Counts
            elif title == "enable_launcher":
                print "Enabling.."
                try:
                    launcher.set_property("count_visible", True)
                except NameError:
                    pass
            elif title == "disable_launcher":
                print "Disabling.."
                try:
                    launcher.set_property("count_visible", False)
                except NameError:
                    pass

            else:
                try:
                    launcher.set_property("count", int(title))
                except NameError:
                    pass

        def press_button(widget, event):
            if event.button == 1:
                if self.drag == True:
                    Gtk.Window.begin_move_drag(self.window,event.button,event.x_root,event.y_root,event.time)

        self.webview.connect('title-changed', title_changed)
        self.webview.connect('navigation-requested', navigation_requested_cb)
        self.webview.connect('console-message', console_message_cb)
        self.webview.connect('button-press-event', press_button)
