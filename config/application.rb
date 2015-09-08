# -*- encoding : utf-8 -*-
require File.expand_path('../boot', __FILE__)

# Pick the frameworks you want:
# require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "sprockets/railtie"
require 'active_support/core_ext/hash/conversions'
require 'jsonpath'
require 'json'
require 'nokogiri'
require 'zip'
require 'open-uri'


# require "rails/test_unit/railtie"

# Assets should be precompiled for production (so we don't need the gems loaded then)
Bundler.require(*Rails.groups(assets: %w(development test)))

module Retorica
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
      config.time_zone = "Brasilia"
      Zip.on_exists_proc = true
      config.serve_static_files = true

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
      config.i18n.enforce_available_locales = false
      config.i18n.available_locales = ["en, pt-BR"]
      config.i18n.default_locale = :'en'
  end
end
