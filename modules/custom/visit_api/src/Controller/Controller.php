<?php

namespace Drupal\visit_api\Controller;

use Drupal\Core\Controller\ControllerBase;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class Controller extends ControllerBase {

    const URL = 'https://78xrvxra6b.execute-api.us-west-2.amazonaws.com/Firehose';

    /**
     * Creates a visit in the db of visit api
     */
    public function postVisit(Request $request) {

        $client = new \GuzzleHttp\Client();
        $headers['Content-Type'] = 'application/json';
        $apiKey = $this->fetchAPIKey();
        if($apiKey == 'ERRORAPIKEY') {
            \Drupal::logger('visit_api')->notice('API key not set. Please add a key value in the visit_api table.');
            return new Response('API key not set. Please add a key value in the visit_api table.');
        }
        $headers['x-api-key'] = $apiKey;
        $url =  self::URL;
        $body = $request->getContent();
      //  $bodyJSON = json_encode($body);

        \Drupal::logger('visit_api')->notice($body);
        try {
            $res = $client->post($url, [
                'http_errors' => false,
                'headers' => $headers,
                'body' => $body
            ]);
        } catch (RequestException $e) {
            return new Response($e);
        }
        return $res;
    }

    /*
     * Function to return the API key value from visit_api table
     */
    private function fetchAPIKey(){
        $query = \Drupal::database()->select('visit_api', 'vpi');
        $query->addField('vpi', 'visit_api_key');
        $query->range(0, 1);
        $apiKey = $query->execute()->fetchField();
        if($apiKey == '') {
            return 'ERRORAPIKEY';
        }
        return $apiKey;
    }
}