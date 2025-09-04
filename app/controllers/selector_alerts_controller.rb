class SelectorAlertsController < ApplicationController
  def index
    alerts = SelectorAlert.open_alerts
    alerts = alerts.for_engine(params[:engine]) if params[:engine].present?
    
    render json: {
      alerts: alerts.map do |alert|
        {
          id: alert.id.to_s,
          engine: alert.engine,
          ts: alert.ts.iso8601,
          dom_signature: alert.dom_signature,
          break_rate: alert.break_rate,
          suggested_patch: alert.suggested_patch,
          status: alert.status
        }
      end
    }
  end

  def acknowledge
    alert = SelectorAlert.find(params[:id])
    alert.update!(status: 'ack')
    
    render json: { message: 'Alert acknowledged', status: alert.status }
  rescue Mongoid::Errors::DocumentNotFound
    render json: { error: 'Alert not found' }, status: 404
  end

  def resolve
    alert = SelectorAlert.find(params[:id])
    alert.update!(status: 'resolved')
    
    render json: { message: 'Alert resolved', status: alert.status }
  rescue Mongoid::Errors::DocumentNotFound
    render json: { error: 'Alert not found' }, status: 404
  end
end
