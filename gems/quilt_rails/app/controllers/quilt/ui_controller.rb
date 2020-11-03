# frozen_string_literal: true

module Quilt
  class UiController < ApplicationController
    include Quilt::ReactRenderable
    layout(false)

    def index
      render_react
    rescue Quilt::ReactRenderable::ReactServerNoResponseError
      sleep(1)
      retry
    end
  end
end
