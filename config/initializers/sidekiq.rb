if production?
  redis_url = ENV['REDIS_URL']
else
  redis_url = 'redis://localhost:6379/0'
end

Sidekiq.configure_server do |config|
  config.redis = {url: redis_url}

  config.server_middleware do |chain|
    chain.add Kiqstand::Middleware
    chain.add Sidekiq::Status::ServerMiddleware
  end
end

if defined?(PhusionPassenger)
  PhusionPassenger.on_event(:starting_worker_process) do |forked|
    Sidekiq.configure_client do |config|
      config.redis = {url: redis_url, size: 1}

      config.client_middleware do |chain|
        chain.add Sidekiq::Status::ClientMiddleware
      end
    end if forked
  end
else
  Sidekiq.configure_client do |config|
    config.redis = {url: redis_url}

    config.client_middleware do |chain|
      chain.add Sidekiq::Status::ClientMiddleware
    end
  end
end

# Error handling via Ratchet
if defined?(Ratchetio)
  module Ratchetio
    class Sidekiq
      def call(worker, msg, queue)
        begin
          yield
        rescue => e
          Ratchetio.report_exception(e, msg)
          raise
        end
      end
    end
  end

  Sidekiq.configure_server do |config|
    config.server_middleware do |chain|
      chain.add ::Ratchetio::Sidekiq
    end
  end
end
