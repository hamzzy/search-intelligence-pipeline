require 'rails_helper'

RSpec.describe Job, type: :model do
  describe 'validations' do
    it 'requires job_id' do
      job = Job.new(q: 'test query', engine: 'google')
      expect(job).not_to be_valid
      expect(job.errors[:job_id]).to include("can't be blank")
    end

    it 'requires unique job_id' do
      Job.create!(job_id: 'test-id', q: 'test query', engine: 'google')
      job = Job.new(job_id: 'test-id', q: 'another query', engine: 'google')
      expect(job).not_to be_valid
      expect(job.errors[:job_id]).to include("has already been taken")
    end

    it 'requires query' do
      job = Job.new(job_id: 'test-id', engine: 'google')
      expect(job).not_to be_valid
      expect(job.errors[:q]).to include("can't be blank")
    end

    it 'requires engine' do
      job = Job.new(job_id: 'test-id', q: 'test query')
      expect(job).not_to be_valid
      expect(job.errors[:engine]).to include("can't be blank")
    end

    it 'validates status inclusion' do
      job = Job.new(job_id: 'test-id', q: 'test query', engine: 'google', status: 'invalid')
      expect(job).not_to be_valid
      expect(job.errors[:status]).to include("is not included in the list")
    end

    it 'is valid with all required fields' do
      job = Job.new(job_id: 'test-id', q: 'test query', engine: 'google')
      expect(job).to be_valid
    end
  end

  describe 'status methods' do
    let(:job) { Job.new(job_id: 'test-id', q: 'test query', engine: 'google') }

    it 'checks if job is queued' do
      job.status = 'queued'
      expect(job.queued?).to be true
      expect(job.running?).to be false
      expect(job.done?).to be false
      expect(job.failed?).to be false
    end

    it 'checks if job is running' do
      job.status = 'running'
      expect(job.queued?).to be false
      expect(job.running?).to be true
      expect(job.done?).to be false
      expect(job.failed?).to be false
    end

    it 'checks if job is done' do
      job.status = 'done'
      expect(job.queued?).to be false
      expect(job.running?).to be false
      expect(job.done?).to be true
      expect(job.failed?).to be false
    end

    it 'checks if job is failed' do
      job.status = 'failed'
      expect(job.queued?).to be false
      expect(job.running?).to be false
      expect(job.done?).to be false
      expect(job.failed?).to be true
    end
  end

  describe '.find_by_job_id' do
    let!(:job) do
      Job.create!(job_id: 'test-id', q: 'test query', engine: 'google')
    end

    it 'finds job by job_id' do
      found_job = Job.find_by_job_id('test-id')
      expect(found_job).to eq(job)
    end

    it 'returns nil for non-existent job_id' do
      found_job = Job.find_by_job_id('non-existent')
      expect(found_job).to be_nil
    end
  end
end
